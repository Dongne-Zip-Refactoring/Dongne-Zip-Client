import { styled } from 'styled-components';
import * as S from '../../styles/mixins';
import { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons'; // 빈 하트
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons'; // 채워진 하트
import ModalLogin from './ModalLogin';
import { useNavigate } from 'react-router-dom';

const s3 = process.env.REACT_APP_S3;
const API = process.env.REACT_APP_API_SERVER;

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  const [liked, setLiked] = useState(product.isFavorite);
  const [likeCount, setLikeCount] = useState(product.favCount);
  const [loading, setLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 지역명
  const regionName = product.Region
    ? `${product.Region.district}`
    : '알 수 없음';

  // 상품 상세 페이지 이동 (모달이 열려있을 때는 이동 X)
  const handleCardClick = () => {
    if (!isLoginModalOpen) {
      navigate(`/purchase/product-detail/${product.id}`);
    }
  };

  // 좋아요 버튼
  const handleLikeClick = async (e) => {
    e.preventDefault(); // 부모 요소 링크 이동 방지
    if (loading) return; // 중복 요청 방지

    try {
      setLoading(true);

      // 로그인 확인 로직은 그대로 유지합니다. (좋은 코드입니다)
      const loginRes = await axios.post(
        `${API}/user/token`,
        {},
        { withCredentials: true },
      );

      if (!loginRes.data.id) {
        setIsLoginModalOpen(true);
        setLoading(false); // 로딩 상태 해제
        return;
      }

      // 1. 새로운 '토글' API 주소로 POST 요청 하나만 보냅니다.
      const res = await axios.post(`${API}/item/${product.id}/favorite`);

      // 2. 서버가 알려준 최종 결과(isFavorite)로 화면 상태를 업데이트합니다.
      if (res.data.success) {
        const newLikedState = res.data.isFavorite;
        setLiked(newLikedState);
        // 찜 개수도 서버 응답을 기반으로 업데이트 할 수 있습니다. (더 정확한 방법)
        // 예: setLikeCount(res.data.favCount);
        // 지금은 이전처럼 증감 방식으로 처리하겠습니다.
        setLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1));
      } else {
        // 서버가 success: false를 반환한 경우 (예: 예외 처리)
        throw new Error(res.data.message);
      }
    } catch (error) {
      console.error('좋아요 처리 중 오류:', error);
      // 여기에 사용자에게 오류를 알려주는 UI 로직 추가 가능 (예: alert)
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ItemContainer onClick={handleCardClick}>
        <ItemImgWrapper>
          <img
            src={product.imgUrl || `${s3}/images/dummy/product-img.png`}
            alt={product.title}
          />
        </ItemImgWrapper>
        <ItemInfoWrapper>
          <ItemTitle>
            <div>{product.title}</div>
            <LikeButton
              onClick={(e) => {
                e.stopPropagation();
                handleLikeClick(e);
              }}
              disabled={loading}
            >
              <FontAwesomeIcon
                icon={liked ? solidHeart : regularHeart}
                style={{ color: liked ? 'red' : 'black' }}
              />
            </LikeButton>
            {loading ? null : <LikeCount liked={liked}>{likeCount}</LikeCount>}
          </ItemTitle>
          <ItemPrice>{product.price.toLocaleString()}원</ItemPrice>
          <ItemPurchasePlace>{regionName}</ItemPurchasePlace>
        </ItemInfoWrapper>
      </ItemContainer>

      {/* 로그인 모달창 */}
      <ModalLogin
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onNavigate={() => {
          setIsLoginModalOpen(false);
          navigate('/login', { replace: true });
        }}
      />
    </>
  );
}

// ---------------- 상품 카드 스타일 ------------------------
const ItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 200px;
  height: 260px;
  padding: 10px;
  margin-bottom: 40px;
  border-color: var(--color-lightgray);

  img {
    border-radius: 10px;
    object-fit: cover;
  }
`;

const ItemImgWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ItemInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 16px;
`;

const ItemTitle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const ItemPrice = styled.div`
  display: flex;
  font-weight: 700;
  margin-bottom: 10px;
`;

const ItemPurchasePlace = styled.div`
  color: var(--color-lightgray);
  font-size: 0.9rem;
`;

// 좋아요
const LikeButton = styled(S.IconMedium)`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  svg {
    font-size: 24px;
    transition: transform 0.2s ease-in-out;
  }

  &:hover svg {
    transform: scale(1.1);
  }
`;

const LikeCount = styled.div`
  font-size: 18px;
  color: ${({ liked }) => (liked ? 'red' : 'black')};
`;
