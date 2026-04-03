const email = `testuser_${Date.now()}@example.com`;
const password = "password123";

async function testApi() {
  console.log("1. Đăng ký tài khoản...");
  const registerRes = await fetch("http://localhost:3000/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Test User",
      email,
      password,
      confirmPassword: password,
      role: "USER"
    })
  });
  const registerData = await registerRes.json();
  console.log("Kết quả đăng ký:", registerData.message);
  
  if (registerData.status !== "success") return;
  
  const token = registerData.data.token;
  
  console.log("\n2. Đăng bài viết mới...");
  const postRes = await fetch("http://localhost:3000/v1/posts", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      content: "Hello thế giới! Đây là một post feed được tạo tự động để test xem dữ liệu có lưu xuống server thành công không."
    })
  });
  const postData = await postRes.json();
  console.log("Kết quả đăng bài:", postData);
  
  console.log("\n3. Lấy danh sách Feed...");
  const getRes = await fetch("http://localhost:3000/v1/posts", {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });
  const getData = await getRes.json();
  console.log("Kết quả danh sách Feed:", getData);
}

testApi().catch(console.error);
