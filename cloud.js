const ENV_ID = "这里写你的环境ID";
const cloud = window.cloud;
cloud.init({
  env: ENV_ID,
});
const db = cloud.database();

function getCurrentUser() {
  return localStorage.getItem("currentUser");
}

async function login(username, password) {
  const r = await db.collection("users").where({ username, password }).get();
  if (r.data.length === 0) return { ok: false, msg: "账号或密码错误" };
  localStorage.setItem("currentUser", username);
  return { ok: true };
}

async function register(username, password, question, answer) {
  const has = await db.collection("users").where({ username }).get();
  if (has.data.length > 0) return { ok: false, msg: "账号已存在" };
  await db.collection("users").add({
    data: { username, password, question, answer }
  });
  return { ok: true, msg: "注册成功" };
}

async function findUser(username) {
  const r = await db.collection("users").where({ username }).get();
  if (r.data.length === 0) return null;
  return r.data[0];
}

async function resetPwd(username, newPassword) {
  const u = await findUser(username);
  if (!u) return false;
  await db.collection("users").doc(u._id).update({
    data: { password: newPassword }
  });
  return true;
}

function logout() {
  localStorage.clear();
  location.href = "login.html";
}