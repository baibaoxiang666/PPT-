// ==========================
// 核心配置（仅需填写环境ID）
// ==========================
const ENV_ID = "你的环境ID";

// ==========================
// 初始化（官方标准写法）
// ==========================
const cloud = window.cloud;
cloud.init({ env: ENV_ID });
const db = cloud.database();

// ==========================
// 工具方法
// ==========================
const auth = {
  getCurrentUser() {
    return localStorage.getItem("currentUser");
  },

  logout() {
    localStorage.clear();
    location.href = "login.html";
  }
};

// ==========================
// 登录业务
// ==========================
async function loginUser(username, password) {
  try {
    const { data } = await db
      .collection("users")
      .where({ username, password })
      .get();

    if (data.length === 0) {
      return { success: false, message: "账号或密码错误" };
    }

    localStorage.setItem("currentUser", username);
    return { success: true };
  } catch (err) {
    console.error("登录异常", err);
    return { success: false, message: "服务异常，请稍后重试" };
  }
}

// ==========================
// 注册业务（无关键字冲突）
// ==========================
async function createUser(username, password, question, answer) {
  try {
    const { data } = await db
      .collection("users")
      .where({ username })
      .get();

    if (data.length > 0) {
      return { success: false, message: "账号已存在" };
    }

    await db.collection("users").add({
      data: { username, password, question, answer }
    });

    return { success: true, message: "注册成功" };
  } catch (err) {
    console.error("注册异常", err);
    return { success: false, message: "注册失败，请检查网络或数据库权限" };
  }
}

// ==========================
// 找回密码业务
// ==========================
async function findUserByUsername(username) {
  try {
    const { data } = await db
      .collection("users")
      .where({ username })
      .get();
    return data[0] || null;
  } catch (err) {
    return null;
  }
}

async function updateUserPassword(username, newPassword) {
  try {
    const user = await findUserByUsername(username);
    if (!user) return false;

    await db.collection("users").doc(user._id).update({
      data: { password: newPassword }
    });
    return true;
  } catch (err) {
    return false;
  }
}