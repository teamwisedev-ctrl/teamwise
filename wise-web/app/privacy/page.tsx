import React from 'react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 py-20 px-6 sm:px-12">
            <div className="max-w-4xl mx-auto bg-slate-800 rounded-2xl p-8 sm:p-12 shadow-xl border border-slate-700">
                <h1 className="text-3xl font-bold text-white mb-8">모이(Moi) 개인정보처리방침</h1>

                <div className="space-y-6 text-slate-300 leading-relaxed">
                    <p>
                        Team Moi(이하 &quot;회사&quot;)는 개인정보 보호법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등 관련 법령에 따라 이용자의 개인정보를 보호하고, 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 수립·공개합니다.
                    </p>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">1. 개인정보의 처리 목적</h2>
                        <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음 목적 이외의 용도로는 법적 근거 없이 이용되지 않습니다.</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>앱 스토어 및 마켓 연동(카페24 등) 서비스 제공 및 상품/주문 정보 동기화</li>
                            <li>회원 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별/인증</li>
                            <li>고충 처리 및 분쟁 조정을 위한 기록 보존</li>
                            <li>신규 서비스 개발 및 맞춤형 혜택 제공(마케팅)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">2. 수집하는 개인정보 항목</h2>
                        <p>회사는 최초 회원 가입 또는 서비스 이용 시 아래와 같은 최소한의 개인정보를 수집하고 있습니다.</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>필수 항목:</strong> 이메일 주소, 비밀번호(암호화), 카페24 쇼핑몰 ID(Mall ID)</li>
                            <li><strong>서비스 이용 중 자동 수집 항목:</strong> 접속 IP 정보, 서비스 이용 기록, 접속 로그, Oauth 연동 Access/Refresh Token</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">3. 개인정보의 보유 및 이용 기간</h2>
                        <p>
                            이용자의 개인정보는 원칙적으로 개인정보의 처리 목적이 달성되거나, 회원의 탈퇴 요청 시 지체 없이 파기됩니다. 단, 관계 법령(전자상거래 등에서의 소비자보호에 관한 법률 등)의 규정에 의하여 보존할 필요가 있는 경우 지정된 기간 동안 보관합니다.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">4. 제3자 제공 및 위탁</h2>
                        <p>
                            회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 이용자가 외부 마켓 연동 서비스(카페24 솔루션 등)를 이용하기 위해 동의한 경우, API 호출 및 연동을 위하여 해당 마켓 플랫폼 제공자에게 필수적인 정보(Access Token 등)가 송수신될 수 있습니다.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">5. 정보주체의 권리와 행사 방법</h2>
                        <p>
                            이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며, 가입 해지를 요청할 수 있습니다. 개인정보 관리책임자에게 서면, 전화, 전자우편 등을 통해 연락하시면 지체 없이 직권으로 파기 조치하겠습니다.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">6. 개인정보 보호책임자</h2>
                        <p>
                            회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 관련 고충처리 및 피해구제를 위하여 아래와 같이 보호책임자를 지정하고 있습니다.<br />
                            본 개인정보처리방침은 Team Moi(이하 &quot;회사&quot;)가 제공하는 모이(Moi) 마켓 통합 솔루션에 적용됩니다.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">부칙</h2>
                        <p>본 개인정보처리방침은 2026년 3월 10일부터 적용됩니다.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
