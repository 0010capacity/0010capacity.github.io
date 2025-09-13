import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="font-sans min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8">
        <h1 className="text-4xl font-bold">개인정보 처리방침</h1>
        <p className="text-lg">
          이 개인정보 처리방침은 귀하가 저희 앱을 사용할 때 개인정보를 어떻게 수집, 사용, 보호하는지 설명합니다.
        </p>
        <h2 className="text-2xl font-semibold">수집하는 정보</h2>
        <p>
          저희는 서비스 제공을 위해 귀하의 이름, 이메일 주소, 사용 데이터를 수집할 수 있습니다.
        </p>
        <h2 className="text-2xl font-semibold">정보 사용 방법</h2>
        <p>
          귀하의 정보는 서비스 개선, 귀하와의 소통, 법적 의무 준수를 위해 사용됩니다.
        </p>
        <h2 className="text-2xl font-semibold">문의하기</h2>
        <p>
          이 개인정보 처리방침에 대한 질문이 있으시면 [귀하의 이메일]로 연락해 주세요.
        </p>
        <Link
          className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          href="/"
        >
          홈으로 돌아가기
        </Link>
      </main>
    </div>
  );
}
