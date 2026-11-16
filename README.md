# Caro Club

Game caro tiếng Việt, giao diện thích ứng điện thoại và máy tính. Không cần thư viện ngoài.

- Đấu máy: hai mức, máy ưu tiên thắng và chặn nước thắng, đánh giá chuỗi quân.
- Hai người trên cùng thiết bị.
- Online: tạo/vào phòng bằng mã, chia sẻ liên kết, khôi phục phiên khi tải lại cùng tab, hai bên đồng ý ván mới.
- Bàn 15×15, ít nhất 5 quân liên tiếp thắng, không áp dụng luật chặn hai đầu.

## Chạy trên máy

Cài Node.js 20 trở lên rồi mở terminal tại thư mục này:

```sh
npm start
```

Mở http://localhost:3000. Kiểm tra: `npm test`.
Hai người cùng mạng có thể dùng địa chỉ IP máy chủ, cổng 3000 (cần cho phép qua tường lửa).

## Chạy online từ repository này

Mã nguồn: https://github.com/vobttruong/caro-online

Mở [Deploy to Render](https://render.com/deploy?repo=https://github.com/vobttruong/caro-online), đăng nhập Render và tạo dịch vụ theo cấu hình `render.yaml`. Kiểm tra gói và chi phí trước khi xác nhận. Khi dịch vụ báo Live, mở URL Render trả về để chơi cả ba chế độ. Tạo phòng rồi gửi liên kết mời cho người thứ hai.

Phòng đang chơi sẽ mất khi dịch vụ khởi động lại. Không tăng số instance vì phòng hiện lưu trong RAM.

## Đưa lên GitHub và chạy online

Tạo repository `caro-online`, rồi chạy tại thư mục dự án:

```sh
git init
git add .
git commit -m "Build Caro Club with AI, local and online play"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/caro-online.git
git push -u origin main
```

Trong Render, tạo Web Service từ repository GitHub, chọn Node, Build Command `npm install --omit=dev`, Start Command `npm start`; hoặc tạo Blueprint dùng `render.yaml`. Khi triển khai xong, gửi URL dịch vụ cho bạn để chơi. Dịch vụ có thể có phí tùy gói bạn chọn.

GitHub lưu mã nguồn; GitHub Pages không chạy máy chủ Node của chế độ online. Cần triển khai toàn bộ ứng dụng trên dịch vụ Node.js.

## Vận hành

Máy chủ xác thực bằng token ngẫu nhiên theo người chơi, kiểm tra lượt và nước đi. Không đưa token vào liên kết chia sẻ. Phòng giữ trong RAM, mất khi máy chủ khởi động lại; dùng một instance. Phòng dọn sau 2 giờ không hoạt động. Giới hạn 5.000 phòng và 400 yêu cầu/phút/IP. Dùng HTTPS ở môi trường triển khai. Nếu cần nhiều máy chủ hoặc lưu lịch sử lâu dài, cần thêm cơ sở dữ liệu và lưu phiên dùng chung. Phông chữ Google có dự phòng phông hệ thống.
