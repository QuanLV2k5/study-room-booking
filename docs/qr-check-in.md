# Check-in bằng ảnh từ thư viện

Ở màn hình **Quét QR check-in**, bấm **Chọn ảnh từ thư viện**, chọn một ảnh hoặc ảnh
chụp màn hình Booking Pass. App đọc QR rồi kiểm tra booking và check-in như khi quét camera.
Nút chọn ảnh vẫn dùng được khi chưa cấp quyền camera. Hủy chọn ảnh sẽ trở về chế độ quét.

Ảnh không có QR, QR khác StudyRoom, Pass Code không khớp, booking không tồn tại/đã hủy
đều không thay đổi trạng thái booking. Booking đã check-in được thông báo riêng.
Nếu đọc được nhiều Booking Pass khác nhau trong một ảnh, app yêu cầu chọn ảnh chỉ có một pass.
Nút bị khóa trong khi đọc ảnh/check-in để tránh xử lý trùng với camera.

## Triển khai

- `expo-image-picker` được cài bằng `npx expo install`, theo SDK 57.
- Bộ chọn ảnh hệ thống chỉ chọn ảnh, không yêu cầu quyền camera hoặc quyền đọc toàn thư viện.
- QR được đọc qua `scanFromURLAsync(uri, ['qr'])` của `expo-camera` trên thiết bị.
- Cấu hình quyền nằm trong `app.json`; image picker không thêm quyền microphone.
- Cả ảnh và camera dùng validator trong `src/utils/check-in.ts` và đọc booking mới nhất từ store.
- Expo Go có sẵn ImagePicker. Nếu dùng development build riêng đã tạo trước khi thêm module,
  cần build lại ứng dụng để đưa module mới vào binary.

## Kiểm tra

```sh
npm run test:qr
npm run lint
npm run typecheck
npx expo export --platform all
```

Trên Android/iOS thật, kiểm tra ảnh QR hợp lệ, hủy chọn ảnh, ảnh mờ/không có QR,
booking bị hủy, và thử chọn ảnh khi từ chối quyền camera. Nên dùng ảnh JPG/PNG rõ nét,
QR đủ lớn và đủ viền trắng. Kiểm thử trình duyệt không thay thế kiểm thử bộ chọn ảnh
và nhận diện native trên điện thoại.

Tài liệu API:
[ImagePicker SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/imagepicker/),
[Camera SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/camera/).
