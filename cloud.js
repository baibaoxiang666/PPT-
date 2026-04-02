// 模拟本地存储
let users = JSON.parse(localStorage.getItem('users') || '[]');
let orders = JSON.parse(localStorage.getItem('orders') || '[]');

// 登录
async function login(username, password) {
    if (username === 'admin' && password === '1234') {
        localStorage.setItem('currentUser', 'admin');
        return { success: true, user: 'admin' };
    }
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        localStorage.setItem('currentUser', username);
        return { success: true };
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
    return { success: true, message: '注册成功' };
}

// 获取当前用户
function getCurrentUser() {
    return localStorage.getItem('currentUser');
}

// 保存订单
async function saveOrder(order) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: '未登录' };
    const newOrder = { ...order, user, time: new Date().toLocaleString() };
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    return { success: true };
}

// 获取订单列表
async function getOrders() {
    const user = getCurrentUser();
    if (user === 'admin') {
        return orders;
    } else {
        return orders.filter(o => o.user === user);
    }
}