// 引入腾讯云 SDK（关键：之前缺失了这个导致报错）
const Cloud = window.Cloud;
const db = Cloud.database();

// 工具函数：获取当前用户
function getCurrentUser() {
    return localStorage.getItem("currentUser");
}

// 工具函数：判断是否为管理员
function isAdmin() {
    const user = getCurrentUser();
    return user === "admin";
}

// 用户登录（对接 v1.0 管理员/普通用户逻辑）
async function login(username, password) {
    try {
        // 管理员账号校验
        if (username === "admin" && password === "123456") {
            localStorage.setItem("currentUser", "admin");
            return { success: true, user: "admin" };
        }

        // 普通用户校验（数据库查询）
        const res = await db.collection("users").where({ username, password }).get();
        if (res.data && res.data.length > 0) {
            localStorage.setItem("currentUser", username);
            return { success: true, user: username };
        } else {
            return { success: false, message: "账号或密码错误" };
        }
    } catch (err) {
        console.error("登录失败：", err);
        return { success: false, message: "服务器异常，请稍后再试" };
    }
}

// 用户注册（数据库写入）
async function register(username, password) {
    try {
        // 校验账号是否已存在
        const exist = await db.collection("users").where({ username }).count();
        if (exist.total > 0) {
            return { success: false, message: "账号已存在，请更换" };
        }

        // 写入数据库
        await db.collection("users").add({
            data: {
                username,
                password,
                createdAt: new Date()
            }
        });
        return { success: true, message: "注册成功，请登录" };
    } catch (err) {
        console.error("注册失败：", err);
        return { success: false, message: "注册失败，请稍后再试" };
    }
}

// 保存订单（v1.0 核心功能：按用户/管理员权限区分）
async function saveOrder(order) {
    try {
        const user = getCurrentUser();
        if (!user) return { success: false, message: "请先登录" };

        await db.collection("orders").add({
            data: {
                ...order,
                createdBy: user,
                createdAt: new Date()
            }
        });
        return { success: true };
    } catch (err) {
        console.error("订单保存失败：", err);
        return { success: false, message: "订单保存失败，请稍后再试" };
    }
}

// 获取订单列表（管理员看全部，普通用户看自己的）
async function getOrders() {
    try {
        const user = getCurrentUser();
        if (!user) return [];

        let query = db.collection("orders").orderBy("createdAt", "desc");
        if (!isAdmin()) {
            query = query.where({ createdBy: user });
        }

        const res = await query.get();
        return res.data || [];
    } catch (err) {
        console.error("获取订单失败：", err);
        return [];
    }
}