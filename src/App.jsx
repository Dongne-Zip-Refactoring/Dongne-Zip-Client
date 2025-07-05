import { Route, Routes } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Index from './pages/mypage/Index';
import EditProfile from './pages/mypage/EditProfile';
import Header from './components/common/Header';
import Home from './pages/Index';
import Purchase from './pages/purchase/Index';
import NotFound from './pages/NotFound';
import { GlobalStyle } from './styles/GlobalStyle';
import { Provider } from 'react-redux';
import store from './store/index';
import SaleRegister from './pages/sales/Index';
import FindPw from './pages/auth/FindPw';
import ProductDetail from './pages/purchase/ProductDetail';
import SellerSales from './pages/sales/SellerSales';
import Chat from './pages/Chat';
import SoldItems from './pages/mypage/SoldItems';
import LikeItems from './pages/mypage/Favorites';
import ChatList from './pages/chatList';
import BoughtItems from './pages/mypage/BoughtItems';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { addNotification } from './store/modules/notificationReducer';

function AppContent() {
  const dispatch = useDispatch();
  const { isLoggedIn, user } = useSelector((state) => state.isLogin);

  useEffect(() => {
    let socket;

    if (isLoggedIn && user?.id) {
      socket = io(process.env.REACT_APP_API);

      socket.on('connect', () => {
        socket.emit('register', user.id);
      });

      socket.on('notification', (data) => {
        console.log('새로운 알림 수신', data);
        dispatch(addNotification(data));
      });

      // 언마운트 시 소켓 연결 정리
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [isLoggedIn, user, dispatch]);
  return (
    <>
      <GlobalStyle />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/purchase" element={<Purchase />} />
        <Route
          path="/purchase/product-detail/:id"
          element={<ProductDetail />}
        />
        <Route path="/chat/:roomId" element={<Chat />}></Route>
        <Route path="/chat-list" element={<ChatList />}></Route>
        <Route path="/sales" element={<SaleRegister />} />
        <Route path="/sales/sellerSales" element={<SellerSales />} />
        <Route path="/login" element={<Login />}></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route path="/mypage" element={<Index />}></Route>
        <Route path="/changeInfo" element={<EditProfile />}></Route>
        <Route path="/findPw" element={<FindPw />}></Route>
        <Route path="/soldItems" element={<SoldItems />}></Route>
        <Route path="/boughtItems" element={<BoughtItems />}></Route>
        <Route path="/likeItems" element={<LikeItems />}></Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
