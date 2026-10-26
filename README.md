# App mới — tối giản, dễ dùng

App làm phim và nội dung AI, giao diện tối giản. Mở `app.html` trong trình
duyệt là dùng được, không cần build, không cần máy chủ.

## Luồng làm việc — chỉ 4 bước

1. **Kịch bản:** dán kịch bản tổng theo mẫu (`TÊN PHIM / NHÂN VẬT / BỐI CẢNH /
   CẢNH + Prompt ảnh / Prompt video`), bấm Phân tích kịch bản.
2. **Tạo nội dung:** sửa prompt từng shot, sao chép prompt video đã ghép
   (phong cách + nhân vật + prompt cảnh) sang tab Muse/Gemini/Veo/fal.ai
   của bạn, tải kết quả về.
3. **Duyệt & Hàng đợi:** duyệt shot, đánh dấu đã có video khi đã tải kết quả thật.
4. **Ghép & Timeline:** xem thứ tự shot và tổng thời lượng, ghép video thật
   bằng công cụ dựng của bạn theo đúng thứ tự này.
5. **Đăng bài:** soạn bản nháp, chọn nền tảng, hẹn giờ. Bản này chưa đăng thật.

Thêm: **Affiliate Shopee** (nhập link + dữ kiện thật, tạo 3 góc kể chuyện
theo mẫu — app không tự đọc Shopee, không tạo link affiliate) và
**Thương hiệu** (lưu tên, giọng văn, màu/phong cách trên máy).

## Làm được gì, và không làm gì

- Làm được: phân tích kịch bản, giữ nhân vật/phong cách nhất quán trong
  prompt shot, quản lý duyệt shot, tính tổng thời lượng, xuất/nhập dự án
  JSON, lưu dữ liệu trên máy (localStorage).
- Không tự làm: không gọi AI thật, không tạo video thật, không đăng bài
  thật, không đọc Shopee tự động. Mọi bước tạo/đăng thật đều do bạn bấm
  và kiểm tra.

## Nguồn gốc

Luồng làm việc lấy từ app Workflow trong repo `app-mooz` (MuseFlow),
nhưng code ở repo này là code viết lại tối giản, không copy nguyên app cũ.
Bản Workflow đầy đủ vẫn nằm ở repo `app-mooz`, không bị thay đổi bởi
repo này.

## Kiểm thử nhanh

```sh
node --check studio.js
```

Mở `app.html`, bấm “Dùng kịch bản mẫu” ở bước Kịch bản, rồi Phân tích
kịch bản — phải thấy 2 shot, đồ thị phim ở Tổng quan, và tổng 10 giây.
