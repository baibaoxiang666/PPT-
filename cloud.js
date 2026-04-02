const ENV_ID = "这里填你的环境ID";
const cloud = window.cloud;
cloud.init({ env: ENV_ID });
const db = cloud.database();

function getCurrentUser() {
  return localStorage.getItem("currentUser");
}

// 登录
async function login(username, password) {
  try {
    const res = await db.collection("users").where({ username, password }).get();
    if (res.data.length === 0) return { ok: false, msg: "账号或密码错误" };
    localStorage.setItem("currentUser", username);
    return { ok: true };
  } catch (err) {
    return { ok: false, msg: "系统异常，请稍后重试" };
  }
}

// 注册（修复版！）
async function register(username, password, question, answer) {
  try {
    const has = await db.collection("users").where({ username }).get();
    if (has.data.length > 0) return { ok: false, msg: "账号已存在" };

    await db.collection("users").add({
      data: { username, password, question, answer }
    });
    return { ok: true, msg: "注册成功" };
  } catch (err) {
    return { ok: false, msg: "注册失败：数据库异常" };
  }
}

// 查找用户
async function findUser(username) {
  try {
    const res = await db.collection("users").where({ username }).get();
    return res.data?.[0] || null;
  } catch (err) {
    return null;
  }
}

// 重置密码
async function resetPwd(username, newPassword) {
  try {
    const user = await findUser(username);
    if (!user) return false;
    await db.collection("users").doc(user._id).update({
      data: { password: newPassword }
    });
    return true;
  } catch (err) {
    return false;
  }
}

function logout() {
  localStorage.clear();
  location.href = "login.html";
}