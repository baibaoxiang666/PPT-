// 初始化云数据库
const cloud = new Cloud({
  env: window.cloudConfig.ENV_ID,
  secretId: window.cloudConfig.SECRET_ID,
  secretKey: window.cloudConfig.SECRET_KEY
});

// 工具函数：获取当前登录用户
function getCurrentUser() {
  return localStorage.getItem('currentUser');
}

// 工具函数：判断是否是管理员
function isAdmin() {
  const user = getCurrentUser();
  return user && user === 'admin';
}

// 用户登录
async function login(username, password) {
  try {
    if (username === 'admin' && password === '123456') {
      localStorage.setItem('currentUser', 'admin');
      return { success: true, user: 'admin' };
    }

    const res = await cloud.database()
      .collection('users')
      .where({ username, password })
      .get();

    if (res.data && res.data.length > 0) {
      localStorage.setItem('currentUser', username);
      return { success: true, user: username };
    } else {
      return { success: false, message: '账号或密码错误' };
    }
  } catch (e) {
    console.error(e);
    return { success: false, message: '登录失败，请稍后重试' };
  }
}

// 用户注册
async function register(username, password) {
  try {
    const exist = await cloud.database()
      .collection('users')
      .where({ username })
      .count();

    if (exist.total > 0) {
      return { success: false, message: '账号已存在' };
    }

    await cloud.database().collection('users').add({
      data: {
        username,
        password,
        createdAt: new Date()
      }
    });

    return { success: true, message: '注册成功，请登录' };
  } catch (e) {
    console.error(e);
    return { success: false, message: '注册失败，请稍后重试' };
  }
}

// 保存订单
async function saveOrder(order) {
  try {
    const user = getCurrentUser();
    if (!user) return { success: false, message: '请先登录' };

    await cloud.database().collection('orders').add({
      data: {
        ...order,
        createUser: user,
        createdAt: new Date()
      }
    });

    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, message: '订单保存失败' };
  }
}

// 获取订单列表（管理员看所有，普通用户看自己的）
async function getOrders() {
  try {
    const user = getCurrentUser();
    if (!user) return [];

    let query = cloud.database().collection('orders');
    if (!isAdmin()) {
      query = query.where({ createUser: user });
    }

    const res = await query.orderBy('createdAt', 'desc').get();
    return res.data || [];
  } catch (e) {
    console.error(e);
    return [];
  }
}