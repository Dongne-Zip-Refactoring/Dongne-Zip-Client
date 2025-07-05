import { styled } from 'styled-components';
// import { Link } from 'react-router-dom';
import ContainerFilter from '../../components/purchase/ContainerFilter';
import ProductCard from '../../components/purchase/ProductCard';
// import { productList } from '../../data/dummyProduct';
import * as S from '../../styles/mixins';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_SERVER;

export default function Index() {
  // 필터링 및 정렬 상태
  const [available, setAvailable] = useState(false);
  const [location, setLocation] = useState(0);
  const [category, setCategory] = useState(0);
  const [sortOption, setSortOption] = useState('latest');

  // 데이터 상태
  const [products, setProducts] = useState([]); // 필터링된 상품 목록
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 검색 관련 상태
  const [keyword, setKeyword] = useState(''); // 검색어
  const [searchResults, setSearchResults] = useState([]); // 검색 결과
  const [isSearched, setIsSearched] = useState(false); // 검색 실행 여부

  const fetchProducts = async () => {
    if (isSearched) setIsSearched(false);
    setLoading(true);
    setError(null);

    // 전체 상품 조회
    try {
      const res = await axios.get(`${API}/item/item`, {
        params: {
          categoryId: category !== 0 ? category : undefined,
          regionId: location !== 0 ? location : undefined,
          status: available ? 'available' : undefined,
          sortBy: sortOption,
        },
      });

      if (res.data.success) {
        // console.log('API 응답 데이터:', res.data.data);
        setProducts(res.data.data);
      } else {
        throw new Error('데이터를 가져오는 데 실패했습니다.');
      }
    } catch (err) {
      console.error('상품 목록 불러오는 중 오류 발생:', err);
      setError('상품을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 검색 함수
  const handleSearch = async () => {
    if (!keyword.trim()) return alert('검색어를 입력해주세요.');
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API}/item/search`, {
        params: { keyword },
      });
      setSearchResults(res.data.success ? res.data.data || [] : []);
      setIsSearched(true);
    } catch (err) {
      setError('검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 필터/정렬 조건이 변경될 때 상품 목록 다시 불러오기
  useEffect(() => {
    if (!isSearched) {
      fetchProducts();
    }
  }, [category, location, available, sortOption, isSearched]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // 화면에 보여줄 상품 목록 결정
  const displayProducts = isSearched ? searchResults : products;

  // useEffect(() => {
  //   fetchProducts();
  // }, [category, location, available, sortOption]);

  // // 필터링된 상품 목록
  // const filteredProducts = products.filter((product) => {
  //   return (
  //     (!available || product.buyerId === null) && // 거래 가능 여부: buyerId가 null인지 확인
  //     (location === 0 || Number(product.Region.id) === Number(location)) && // 지역 필터
  //     (category === 0 || Number(product.Category.id) === Number(category)) // 카테고리 필터
  //   );
  // });

  // // 정렬 적용 (최신순/ 인기순)
  // const sortedProducts = [...filteredProducts].sort((a, b) => {
  //   if (sortOption === 'latest') {
  //     return b.id - a.id;
  //   } else if (sortOption === 'popular') {
  //     return b.favCount - a.favCount; // 좋아요 개수 기준 정렬
  //   }
  //   return 0;
  // });

  return (
    <S.MainLayout>
      {/* ----------- 필터 영역 -----------*/}
      <ContainerFilter
        available={available}
        setAvailable={setAvailable}
        location={location}
        setLocation={setLocation}
        category={category}
        setCategory={setCategory}
        sortOption={sortOption}
        setSortOption={setSortOption}
      />

      {/* ----------- 검색 영역 -----------*/}
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="검색어를 입력하세요"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <SearchButton onClick={handleSearch}>검색</SearchButton>
        {isSearched && (
          <ResetButton onClick={() => setIsSearched(false)}>
            전체 목록 보기
          </ResetButton>
        )}
      </SearchContainer>

      {/* ----------- 상품 목록 -----------*/}

      <ProductListContainer>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : displayProducts.length > 0 ? (
          displayProducts.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} />
            </div>
          ))
        ) : isSearched ? ( // 👈 [추가] 검색을 했는데 결과가 없는 경우
          <p>검색 결과가 없습니다</p>
        ) : (
          // 👈 [기존] 검색하지 않았는데 상품이 없는 경우
          <p>상품이 없습니다</p>
        )}
      </ProductListContainer>
    </S.MainLayout>
  );
}

const SearchContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
  gap: 10px;
`;

const SearchInput = styled.input`
  width: 300px;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const SearchButton = styled.button`
  padding: 8px 16px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const ResetButton = styled.button`
  padding: 8px 16px;
  background-color: #777;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

// 상품 목록 그리드
const ProductListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  justify-content: center;

  @media (max-width: 767px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;
