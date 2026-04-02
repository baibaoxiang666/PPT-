const ENV_ID = "你的环境ID";
const cloud = window.cloud;
cloud.init({ env: ENV_ID });
const db = cloud.database();

function getCurrentUser() {
  return localStorage.getItem("currentUser");
}

async function login(username, password) {
  try {
    const res = await db.collection("users").where({ username, password }).get();
    if (res.data.length === 0) return { ok: false, msg: "账号或密码错误" };
    localStorage.setItem("currentUser", username);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, msg: "登录异常" };
  }
}

async function register(username, password, question, answer) {
  try {
    const has = await db.collection("users").where({ username }).get();
    if (has.data.length > 0) return { ok: false, msg: "账号已存在" };

    const data = {
      username: username,
      password: password,
      question: question,
      answer: answer
    };

    await db.collection("users").add({ data: data });
    return { ok: true, msg: "注册成功" };
  } catch (e) {
    console.error(e);
    return { ok: false, msg: "注册失败：数据库异常" };
  }
}

async function findUser(username) {
  try {
    const r = await db.collection("users").where({ username }).get();
    return r.data?.[0] || null;
  } catch (e) {
    return null;
  }
}

async function resetPwd(username, newPassword) {
  try {
    const user = await findUser(username);
    if (!user) return false;
    await db.collection("users").doc(user._id).update({
      data: { password: newPassword }
    });
    return true;
  } catch (e) {
    return false;
  }
}

function logout() {
  localStorage.clear();
  location.href = "login.html";
}