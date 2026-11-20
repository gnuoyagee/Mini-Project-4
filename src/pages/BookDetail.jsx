import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_URL } from "../api/books";

export default function BookDetail() {
  const { id } = useParams(); // id 읽기
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cancelHandle = new AbortController();

    async function loadBook() {
      // 새 요청 시작 시 로딩을 켜고 이전 에러를 지워 줌
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/${id}`, {
          signal: cancelHandle.signal, // fetch를 취소 기능과 연결
        });

        // 에러 시 예외 처리
        if (response.status === 404) {
          throw new Error("해당 도서를 찾을 수 없습니다.");
        }
        if (!response.ok) {
          throw new Error("도서 정보를 불러오지 못했습니다.");
        }

        // 응답을 자바스크립트 객체로 읽어 book에 저장
        setBook(await response.json());
      } catch (err) {
        // 화면 이동으로 요청이 취소된 경우는 에러 메시지 띄우지 X
        if (!cancelHandle.signal.aborted) {
          setError(err.message);
        }
      } finally {
        // 취소된 요청이 아닐 경우 성공/실패와 상관없이 로딩을 끝냄
        if (!cancelHandle.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadBook();

    // 화면 이동 or id가 변경된 경우 이전 요청 취소
    return () => cancelHandle.abort();
  }, [id]); // 처음 화면 열거나 id가 바뀔 때 실행

  function handleCoverEdit() {}

  return (
    <div>
      <section>
        {/* 목록 페이지로 돌아가는 링크 */}
        {loading && <p>도서 정보를 불러오는 중이에요...⌛</p>}

        {!loading && error && <p role="alert">{error}</p>}

        {!loading && !error && book && (
          <>
            <h1>{book.title}</h1>
            <h3>저자 {book.author}</h3>
            <p>등록일자: {new Date(book.createdAt).toLocaleString("ko-KR", {
              //yyyy. mm. dd. 00:00  
              timeZone: "Asia/Seoul",
              dateStyle: "medium",
              timeStyle: "short",
              hour12: false,
              })}
            </p>

            {book.createdAt !== book.updatedAt && (
              //yyyy. mm. dd. 00:00  
              <p>수정일자: {new Date(book.updatedAt).toLocaleString("ko-KR", {
              timeZone: "Asia/Seoul",
              dateStyle: "medium",
              timeStyle: "short",
              hour12: false,
              })}
               </p>
              )}

            {book.coverImageUrl && (
              <img
                src={book.coverImageUrl}
                alt={`${book.title} 표지`}
                width={180}
              />
            )}
            <button type="button" onClick = {handleCoverEdit}>
              {book.coverImageUrl ? "표지 수정" : "표지 추가"}  
            </button>

            <h3>줄거리</h3>
            <p>{book.content || "등록된 도서 소개가 없어요."}</p>
            <Link to={`/books/${id}/edit`}>도서 수정</Link>
          </>
        )}
      </section>
    </div>
  );
}
