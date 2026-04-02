// 本地存储模拟（替代云数据库，解决报错）
let orders = JSON.parse(localStorage.getItem('orders') || '[]');
let users = JSON.parse(localStorage.getItem('users') || '[]');

// 获取当前用户
function getCurrentUser() {
    return localStorage.getItem('currentUser');
}

// 登录
async function login(username, password) {
    // 管理员账号
    if (username === 'admin' && password === '123456') {
        localStorage.setItem('currentUser', 'admin');
        return { success: true, user: 'admin' };
    }

    // 普通用户验证
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        localStorage.setItem('currentUser', username);
        return { success: true, user: username };
    } else {
        return { success: false, message: '账号或密码错误' };
    }
}

// 注册
async function register(username, password) {
    if (users.find(u => u.username === username)) {
        return { success: false, message: '账号已存在' };
    }
    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    return { success: true, message: '注册成功，请登录' };
}

// 保存订单
async function saveOrder(order) {
    order.id = Date.now();
    order.createdAt = new Date().toISOString();
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    return { success: true };
}

// 获取订单列表（管理员看所有，普通用户看自己的）
async function getOrders() {
    const currentUser = getCurrentUser();
    if (currentUser === 'admin') {
        return orders;
    } else {
        return orders.filter(order => order.createUser === currentUser);
    }
}