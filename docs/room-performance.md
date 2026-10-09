# Dữ liệu phòng và kiểm tra hiệu năng

Danh sách gồm **102 phòng**, theo cấu hình trong `src/constants/rooms.ts`:

| Khu | Tòa | Tầng | Phòng mỗi tầng | Tổng | Sức chứa |
| --- | --- | --- | --- | --- | --- |
| K | A | 1–4 | 8 | 32 | 55–65 sinh viên |
| K | B | 1–3 | 10 | 30 | 55–65 sinh viên |
| K | C | 1–2 | 5 | 10 | 65–80 sinh viên |
| V | V | 1–5 | 6 | 30 | 55–65 sinh viên |

Mã phòng theo tòa, tầng và số thứ tự: `A101`, `B310`, `C205`, `V506`.
Sức chứa từng phòng và thiết bị là dữ liệu mô phỏng trong giới hạn được cung cấp;
ảnh là ảnh minh họa. Phòng C401 cũ được bỏ vì tòa C chỉ có 2 tầng. Các mã phòng
cũ hợp lệ được giữ lại. Dữ liệu booking lưu trên máy không bị xóa.

## Các tối ưu đã áp dụng

- FlatList chỉ render một cửa sổ của danh sách, với 4 thẻ mỗi batch và cửa sổ 7 màn hình.
- Callback mở phòng và render thẻ ổn định; React.memo có thể bỏ qua thẻ không đổi.
- Trạng thái bận/trống được tính một lần mỗi lần booking/thời gian đổi, rồi tra bằng Set.
- `expo-image` cache ảnh trong bộ nhớ và trên đĩa; ảnh có kích thước giới hạn và được dùng lại.
- Bộ lọc tìm kiếm dùng deferred value để ưu tiên phản hồi ô nhập.
- Bộ lọc mở rộng được thu gọn mặc định để thấy phòng ngay trên màn hình đầu.
- Timer trạng thái chỉ hoạt động ở màn hình đang focus và chỉ cập nhật khi app active.
- Không có callback cập nhật React state theo từng frame cuộn.
- Thẻ có chiều cao linh hoạt để hỗ trợ cỡ chữ lớn và nhãn thiết bị xuống dòng. Không dùng
  `getItemLayout` với chiều cao giả định, vì sẽ tính sai vị trí khi đổi cỡ chữ/chiều rộng.

## Kiểm tra tự động

```sh
npm run test:rooms
npm run typecheck
npm run lint
npx expo export --platform all
```

Các test kiểm tra tổng phòng, mã phòng duy nhất, số phòng/tầng, giới hạn sức chứa,
bộ lọc kết hợp và trạng thái booking tại thời điểm bắt đầu/kết thúc khung giờ.
Test logic và export bundle không phải phép đo FPS.

## Đo mục tiêu 60fps trên mobile

**Chưa có số đo FPS trên thiết bị trong lần triển khai này.** Cần kiểm tra trên bản release
và thiết bị mục tiêu trước khi nghiệm thu yêu cầu 60fps. Máy phát triển hiện không có
Android SDK/emulator. Không dùng kết quả browser hoặc Expo Go/dev mode làm bằng chứng
cho FPS của bản release.

1. Cài bản release trên thiết bị thật, ghi lại model, hệ điều hành, tần số quét và phiên bản app.
2. Bỏ tất cả bộ lọc; xác nhận hiển thị `102 / 102 phòng phù hợp`.
3. Cuộn nhanh từ đầu đến cuối và ngược lại trong 30 giây, lặp lại 3 lần. Kiểm tra cả lần tải
   ảnh đầu tiên và lần ảnh đã được cache; ghi riêng hai trường hợp.
4. Lặp lại với bộ lọc khu V/tầng 5, tòa C/sức chứa 80+, và sau khi đặt/hủy phòng.
5. Dùng công cụ frame timeline của nền tảng (Android: Perfetto; iOS: Instruments) để ghi
   trace. Kiểm tra thời gian frame so với ngân sách **16,67ms ở 60Hz**, số frame trễ,
   khoảng cuộn bị giật và ô phòng bị trắng khi fling. Chụp trace kèm báo cáo.
6. Đổi cỡ chữ lớn để kiểm tra không cắt nhãn; thử mở một phòng sau khi cuộn xuống cuối.

Nếu xuất hiện ô trắng khi fling, tăng `maxToRenderPerBatch` từ 4 lên 6 hoặc `windowSize`
từ 7 lên 9 rồi đo lại. Nếu JS bị nghẽn, kiểm tra profiler trước khi tăng batch. Các giá trị
hiện tại là cấu hình ban đầu cần xác nhận trên thiết bị, không phải cam kết FPS mọi máy.

Tham khảo chính thức:
[React Native 0.86: hiệu năng](https://reactnative.dev/docs/0.86/performance),
[tối ưu FlatList](https://reactnative.dev/docs/0.86/optimizing-flatlist-configuration),
[Expo SDK 57: Image](https://docs.expo.dev/versions/v57.0.0/sdk/image/).
