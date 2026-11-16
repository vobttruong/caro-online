# Caro Club — GitHub Pages

Game caro tiếng Việt: đấu máy, hai người cùng thiết bị, hai người online qua mã phòng. Bàn 15×15; ít nhất 5 quân liên tiếp thắng, kể cả bị chặn hai đầu.

## Triển khai

Đưa mã vào nhánh main của repository. Trong Settings → Pages → Source, chọn GitHub Actions. Trong Actions, chạy workflow Deploy Caro to GitHub Pages; các lần push main tiếp theo tự triển khai. URL: https://vobttruong.github.io/caro-online/ .

index.html có tại thư mục gốc nên cách Pages truyền thống từ nhánh main và thư mục / (root) cũng hiển thị game. Workflow chỉ đóng gói các tệp giao diện, không công khai tệp phát triển.

## Online

Chọn Chơi online → Tạo phòng mới, gửi liên kết mời hoặc mã 12 ký tự. Người thứ hai mở website, nhập mã rồi bấm Vào. Chủ phòng cầm X; khách cầm O. Cả hai bấm Ván mới để chơi lại. Người có mã có thể vào nếu phòng trống.

Giữ cả hai trang mở. Tải lại trang hoặc đổi chế độ kết thúc phiên online. Khi mất kết nối, tạo phòng mới. Không lưu lịch sử.

Online dùng WebRTC và PeerJS Cloud để báo hiệu; dữ liệu ván cờ truyền giữa hai trình duyệt. Không cần Render hoặc máy chủ Node riêng. Một số mạng hoặc NAT có thể chặn kết nối; thử mạng khác. Chưa cấu hình TURN riêng nên không bảo đảm mọi mạng kết nối được. Chủ phòng kiểm tra luật và kiểm soát trạng thái: không dùng cho thi đấu có thưởng.

PeerJS 1.5.5 được lưu ở vendor/ cùng giấy phép MIT. Tài liệu: https://peerjs.com/client/faq . Không cần camera hay microphone.

## Phát triển

Cần Node.js 20+. Không cần cài package. Chạy `npm test` và `npm run build`. Dùng máy chủ HTTP tĩnh phục vụ thư mục gốc hoặc dist/; không mở file:// vì sử dụng JavaScript modules.

Kiểm thử online dùng truyền tải giả lập để kiểm tra giao thức và lượt đánh. Cần thử hai trình duyệt thật trên mạng thực để xác nhận WebRTC.
