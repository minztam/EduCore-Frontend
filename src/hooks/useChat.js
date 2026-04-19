import { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

const useChat = (roomId, token) => {
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(null);
  const connectionRef = useRef(null);

  useEffect(() => {
    if (!roomId || !token) return;

    // Guard 1: Biến cờ để theo dõi vòng đời component
    let isMounted = true;

    const hubBaseUrl = process.env.REACT_APP_API_BASE_URL
      ? process.env.REACT_APP_API_BASE_URL.replace('/api', '')
      : 'https://educore-api-d1v2.onrender.com';

    const newConnection = new signalR.HubConnectionBuilder()
      // Sử dụng hubBaseUrl để gọi đúng vào chatHub trên Render
      .withUrl(`${hubBaseUrl}/chatHub`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // const newConnection = new signalR.HubConnectionBuilder()
    //   .withUrl('https://localhost:7015/chatHub', {
    //     accessTokenFactory: () => token,
    //   })
    //   .withAutomaticReconnect()
    //   // Tắt log dư thừa nếu không cần debug sâu
    //   .configureLogging(signalR.LogLevel.Warning)
    //   .build();

    const startSignalR = async () => {
      try {
        await newConnection.start();

        // Guard 2: Chỉ thực hiện logic tiếp theo nếu component chưa unmount
        if (
          isMounted &&
          newConnection.state === signalR.HubConnectionState.Connected
        ) {
          console.log(
            `%c[SignalR] Connected to Room: ${roomId}`,
            'color: #10b981; font-weight: bold;'
          );

          await newConnection.invoke('JoinRoom', roomId.toString());

          connectionRef.current = newConnection;
          setConnection(newConnection);
        }
      } catch (err) {
        // Chỉ log lỗi nếu thực sự là lỗi kết nối, không phải do unmount
        if (isMounted) {
          console.error('SignalR Connection Error: ', err);
        }
      }
    };

    newConnection.on('ReceiveMessage', (message) => {
      if (isMounted) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    });

    startSignalR();

    // Cleanup: Ngắt kết nối đồng bộ với vòng đời React
    return () => {
      isMounted = false; // Đánh dấu đã rời khỏi component

      const stopConnection = async () => {
        // Kiểm tra trạng thái kỹ trước khi ra lệnh
        if (newConnection) {
          try {
            if (newConnection.state === signalR.HubConnectionState.Connected) {
              await newConnection.invoke('LeaveRoom', roomId.toString());
            }
            await newConnection.stop();
            console.log(
              `%c[SignalR] Disconnected from Room: ${roomId}`,
              'color: #ef4444; font-weight: bold;'
            );
          } catch (err) {
            // Lỗi khi stop thường do kết nối chưa kịp start xong, có thể bỏ qua
          }
        }
      };

      stopConnection();
      setMessages([]); // Xóa tin nhắn cũ để sẵn sàng cho phòng mới
      setConnection(null);
    };
  }, [roomId, token]);

  return { messages, setMessages, connection };
};

export default useChat;
