# MooZ Studio v3 — bản hoàn chỉnh

App làm phim và nội dung AI, giao diện hoàn chỉnh. Mở `app.html` trong
trình duyệt là dùng được, không cần build, không cần máy chủ.

## Mở app như thế nào
1. Tải repo về (Download ZIP hoặc `git clone`), giải nén.
2. Giữ `app.html`, `app.css`, `studio.js` trong cùng một thư mục.
3. Nhấp đúp mở `app.html` bằng trình duyệt.

## Có gì trong v3
- **Đa dự án:** tạo, mở, nhân bản, xóa dự án; đổi tên dự án đang mở.
- **Kịch bản:** mẫu Phim ngắn / Quảng cáo sản phẩm / Affiliate ngắn,
  phân tích thành shot, nhân vật, phong cách.
- **Nhân vật:** thêm, sửa, xóa nhân vật; mô tả nhân vật được ghép vào
  mọi prompt shot.
- **Shot & Prompt:** sửa prompt ảnh/video, preset đạo diễn nhanh
  (cỡ cảnh, chuyển động máy, cảm xúc), bảng kiểm duyệt 3 mục
  (nhân vật / trang phục / không chữ lỗi), kiểm tra nhất quán tự động,
  sao chép prompt, lưu prompt vào thư viện, nhân bản, sắp xếp, lọc shot.
- **Storyboard:** xem nhanh từng shot theo thứ tự ghép.
- **Duyệt & Hàng đợi:** duyệt shot, đánh dấu đã có video thật.
- **Timeline:** thanh màu theo tỉ lệ thời lượng, tổng thời lượng,
  xuất danh sách ghép ra TXT.
- **Đăng bài:** bộ caption ghép từ phim + thương hiệu, lưu bản nháp,
  hẹn giờ, đánh dấu đã đăng.
- **Affiliate Shopee:** nhập link + dữ kiện thật, tạo 3 góc kể chuyện,
  lưu góc thành bản nháp đăng bài.
- **Thương hiệu:** nhiều thương hiệu, chọn thương hiệu đang dùng.
- **Thư viện prompt:** lưu, sao chép, xóa prompt hay dùng lại.
- **Xuất/nhập:** xuất tất cả dữ liệu ra JSON ở Tổng quan, nhập lại
  trên máy khác. Dữ liệu chỉ lưu trên trình duyệt của máy bạn.

## Sáng tạo từ đâu, giới hạn nào
Khung luồng mượn từ app Workflow (app-mooz): kịch bản → nhân vật →
shot → storyboard → duyệt → timeline → đăng bài. Các tính năng trên
(preset đạo diễn, bảng kiểm duyệt, kiểm tra nhất quán, storyboard
theo tỉ lệ, bộ caption, thư viện prompt, đa dự án) là sáng tạo riêng
của bản này, code viết lại, không copy nguyên app-mooz.

**Không tự làm:** không gọi AI thật, không tạo video thật, không đăng
bài thật, không đọc Shopee tự động. Bạn sao chép prompt sang AI của
mình, tải kết quả về, rồi đánh dấu hoàn thành trong app.

## Kiểm thử nhanh
```sh
node --check studio.js
```
Mở `app.html`, bấm “Dùng kịch bản mẫu” ở bước Kịch bản, rồi Phân tích
kịch bản — phải thấy 2 shot, và tổng 10 giây ở Timeline.
