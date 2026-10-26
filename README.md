# App mới — bản sáng tạo, dựa trên luồng app-mooz

App làm phim và nội dung AI, giao diện tối giản. Mở `app.html` trong trình
duyệt là dùng được, không cần build, không cần máy chủ.

## Mượn luồng nào từ app-mooz, sáng tạo thêm cái gì

**Mượn khung luồng (không copy code):** kịch bản tổng → chia shot → duyệt
shot → xem thứ tự ở Timeline → soạn bản nháp đăng bài. Khung này đã được
chứng minh trong app Workflow (app-mooz), nên giữ lại cho dễ hiểu.

**Sáng tạo riêng của bản này:**
- **Mẫu dự án 1 bấm:** Phim ngắn, Quảng cáo sản phẩm, Video Affiliate ngắn
  — bấm là có kịch bản mẫu đúng định dạng, sửa theo ý bạn.
- **Đạo diễn nhanh:** mỗi shot chọn sẵn cỡ cảnh (toàn/trung/cận/đặc tả),
  chuyển động máy (quay theo, quay vòng chậm, máy tĩnh...) và cảm xúc;
  app tự ghép vào prompt video, khỏi gõ lại mỗi shot.
- **Bảng kiểm duyệt:** mỗi shot tick 3 mục trước khi duyệt — nhân vật
  đúng người, trang phục đúng mẫu không thêm/bớt chi tiết, không có chữ
  lạ/chữ ngược trong khung hình. Đặc biệt hữu ích cho video quảng cáo
  quần áo, nơi sai một chi tiết là sai cả sản phẩm.
- **Kiểm tra nhất quán tự động (không dùng AI):** báo shot dài quá 10s
  nên tách, shot trùng tên, shot chưa chọn chuyển động máy, shot chưa
  kiểm đủ 3 mục.
- **Storyboard Timeline theo tỉ lệ:** thanh màu ngang, mỗi ô dài tỉ lệ
  với thời lượng shot; xanh = đã có video, vàng = đã duyệt, xám = chưa
  duyệt. Nhìn là thấy shot nào đang chiếm nhiều thời gian nhất.
- **Bộ caption tự ghép:** từ tên phim + tên các shot + thương hiệu bạn
  đã nhập, không tự bịa giá, khuyến mãi hay công dụng chưa kiểm chứng.

## Luồng làm việc — chỉ 4 bước

1. **Kịch bản:** dán kịch bản tổng theo mẫu (`TÊN PHIM / NHÂN VẬT / BỐI CẢNH /
   CẢNH + Prompt ảnh / Prompt video`), hoặc bấm một mẫu dự án, rồi bấm
   Phân tích kịch bản.
2. **Tạo nội dung:** sửa prompt từng shot, chọn preset đạo diễn nhanh,
   tick bảng kiểm duyệt, sao chép prompt video đã ghép (phong cách +
   nhân vật + cỡ cảnh + chuyển động + cảm xúc + prompt cảnh) sang tab
   Muse/Gemini/Veo/fal.ai của bạn, tải kết quả về.
3. **Duyệt & Hàng đợi:** duyệt shot, đánh dấu đã có video khi đã tải
   kết quả thật.
4. **Ghép & Timeline:** xem storyboard theo tỉ lệ và tổng thời lượng,
   ghép video thật bằng công cụ dựng của bạn theo đúng thứ tự này.
5. **Đăng bài:** bấm tạo bộ caption, sửa lại, lưu bản nháp, chọn nền
   tảng, hẹn giờ. Bản này chưa đăng thật.

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

## Kiểm thử nhanh

```sh
node --check studio.js
```

Mở `app.html`, bấm “Dùng kịch bản mẫu” ở bước Kịch bản, rồi Phân tích
kịch bản — phải thấy 2 shot, đồ thị phim ở Tổng quan, và tổng 10 giây.
Sang bước Tạo nội dung, phải thấy mục “Kiểm tra nhất quán” và bảng kiểm
duyệt 3 mục trong mỗi shot.
