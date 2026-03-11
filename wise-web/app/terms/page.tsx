import React from 'react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 py-20 px-6 sm:px-12">
            <div className="max-w-4xl mx-auto bg-slate-800 rounded-2xl p-8 sm:p-12 shadow-xl border border-slate-700">
                <h1 className="text-3xl font-bold text-white mb-8">Mo2 서비스 이용약관</h1>

                <div className="space-y-6 text-slate-300 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">제1조 (목적)</h2>
                        <p>
                            본 약관은 Team Mo2(이하 &quot;회사&quot;)가 제공하는 Mo2 마켓 통합 솔루션 및 관련 제반 서비스(이하 &quot;서비스&quot;)의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">제2조 (용어의 정의)</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>&quot;서비스&quot;: 회원이 PC, 휴대형 단말기 등 각종 유무선 기기를 통해 이용할 수 있는 Mo2 상품 연동 및 관리 서비스를 의미합니다.</li>
                            <li>&quot;회원&quot;: 회사의 서비스에 접속하여 본 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.</li>
                            <li>&quot;카페24 연동&quot;: 카페24 오픈 API를 통하여 회원의 쇼핑몰 데이터를 양방향으로 동기화하는 기능을 의미합니다.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">제3조 (약관의 효력 및 변경)</h2>
                        <p>
                            회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면이나 약관 도메인 부분에 게시합니다.
                            회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있으며, 변경된 약관은 적용일자 7일 전(중대한 변경의 경우 30일 전) 공지함으로써 효력이 발생합니다.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">제4조 (서비스의 제공 및 한계)</h2>
                        <p>
                            회사는 무료(Free) 플랜과 유료(Pro) 플랜을 구분하여 서비스를 제공할 수 있습니다. 무료 플랜의 경우 카페24 1개 마켓 연동으로 기능이 제한되며, 서버 트래픽 방지를 위해 일일 동기화 건수가 제한될 수 있습니다.
                            서비스 내에서 타사(카페24 등) API 장애로 인해 발생하는 상품 동기화 지연 및 누락에 대해서 회사는 고의 또는 중과실이 없는 한 책임을 지지 않습니다.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">제5조 (회원의 의무 및 계정 관리)</h2>
                        <p>
                            회원은 서비스 이용 과정에서 선량한 풍속 기타 사회질서에 반하는 행위, 타인의 권리를 침해하는 행위, 불법적인 목적으로 오픈마켓 API를 오남용하는 행위를 하여서는 안 됩니다.
                            회원의 관리 소홀이나 제3자에 의한 계정 도용 등으로 발생하는 모든 불이익에 대한 책임은 회원 본인에게 있습니다.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">제6조 (계약해지 및 이용제한)</h2>
                        <p>
                            회원은 언제든지 마이페이지 또는 앱 내 설정 메뉴를 통하여 이용계약 해지(회원탈퇴)를 신청할 수 있으며, 회사는 관련 법령이 정하는 바에 따라 이를 지체 없이 처리합니다.
                            회원이 본 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 회사는 사전 통지 후(긴급 시 사후 통지) 서비스 이용을 제한하거나 계약을 해지할 수 있습니다.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">부칙</h2>
                        <p>본 약관은 2026년 3월 10일부터 렌더링 및 적용됩니다.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
