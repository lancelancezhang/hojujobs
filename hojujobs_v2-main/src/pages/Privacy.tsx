import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { useSEO } from "@/hooks/useSEO";

const CANONICAL = "https://hojujobs.com/privacy";

export default function Privacy() {
  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "개인정보처리방침 (Privacy Policy) | Hoju Jobs",
      url: CANONICAL,
      description: "Hoju Jobs 개인정보 처리—한국어 안내 뒤 영문 전문. Korean summary then full English policy.",
      inLanguage: ["ko", "en"],
    }),
    [],
  );

  useSEO({
    title: "개인정보처리방침 | Hoju Jobs — 호주 한인 구인구직",
    description:
      "개인정보처리방침(한국어·English). Hoju Jobs 개인정보 수집·이용·보관 및 제3자·문의. Privacy Policy in Korean and English.",
    canonical: CANONICAL,
    htmlLang: "ko",
    ogLocale: "ko_KR",
    keywords:
      "개인정보처리방침, Hoju Jobs privacy, privacy policy, personal information, Google OAuth, Supabase, 호주 구인 사이트, data protection, Korean jobs Australia",
    jsonLd,
  });

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col bg-background">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          홈으로
        </Link>

        <header>
          <h1 className="text-2xl sm:text-3xl font-bold" lang="ko">
            개인정보처리방침
          </h1>
        </header>

        <div className="space-y-8">
          <section lang="ko" className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Hoju Jobs(이하 &quot;당사&quot;)는 <strong>호주 한인 구인구직</strong> 온라인 서비스(이하 &quot;서비스&quot;)를 운영하며, 이용자의
              개인정보를 중요하게 다룹니다. 아래는 <strong>이해를 돕기 위한 한국어 요약</strong>이며, 법적 세부·정의는 하단{" "}
              <strong>영문 본문</strong>을 함께 확인해 주시기 바랍니다(해석이 상충하는 경우, 관할 법에 따라 달리 해석될 수
              있습니다).
            </p>

            <section className="space-y-2">
              <h3 className="text-base font-semibold">1. 수집하는 정보</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Google</strong> 등으로 로그인할 때 이름, 이메일, 프로필 사진 등이 제공될 수 있으며,{" "}
                <strong>회원</strong> 관리·공고 등록·문의에 필요한 <strong>게시·입력</strong> 정보(직무, 지역, 연락처
                등)를 수집할 수 있습니다. 보안·서비스 개선을 위한 <strong>기기·접속·로그</strong> 정보를 수집할 수
                있습니다.
              </p>
            </section>
            <section className="space-y-2">
              <h3 className="text-base font-semibold">2. 이용 목적</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                서비스 제공·이용자 인증·고객 응대·부정이용 방지·약관/법령 준수, 통계(식별이 불가능한 형태)에 활용합니다.
              </p>
            </section>
            <section className="space-y-2">
              <h3 className="text-base font-semibold">3. 처리 근거(해당하는 경우)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>계약 이행</strong>, <strong>정당한 이익</strong>(보안, 서비스 개선), <strong>동의</strong> 등
                관할지 법에 따릅니다.
              </p>
            </section>
            <section className="space-y-2">
              <h3 className="text-base font-semibold">4. 쿠키·유사 기술</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                로그인·세션 유지 등 <strong>필수</strong> 목적에 한해 쿠키·로컬 스토리지를 사용할 수 있으며, 교차 사이트
                <strong> 광고 추적</strong> 쿠키는 사용하지 않는 것이 원칙입니다(변경 시 본 정책을 고지).
              </p>
            </section>
            <section className="space-y-2">
              <h3 className="text-base font-semibold">5. 처리 위탁·제3자</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Supabase</strong> 등 <strong>인프라·호스팅</strong> 업체에 데이터가 저장·처리될 수 있고,{" "}
                <strong>Google</strong>이 로그인 시 정보 처리에 관여합니다. 각 제공자는 자체 약관·정책이 적용됩니다.
              </p>
            </section>
            <section className="space-y-2">
              <h3 className="text-base font-semibold">6. 보유·삭제</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                계정 유지, 분쟁·법적 의무, 서비스 운영에 필요한 기간 동안 보관할 수 있으며, 삭제·탈퇴 요청 시 법이 허용하는
                범위에서 <strong>삭제·비식별</strong> 조치를 합니다.
              </p>
            </section>
            <section className="space-y-2">
              <h3 className="text-base font-semibold">7. 국외 이전</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                서비스 업체는 이용자의 거주지와 다른 국가에서 데이터를 처리할 수 있으며, 이 정책 및 적용 법에 맞는 보호
                조치를 취합니다.
              </p>
            </section>
            <section className="space-y-2">
              <h3 className="text-base font-semibold">8. 보안</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                기술·관리적 보호조치를 적용하나, <strong>인터넷 전송</strong>은 100% 안전하다고 보장할 수 없습니다.
              </p>
            </section>
            <section className="space-y-2">
              <h3 className="text-base font-semibold">9. 이용자 권리</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                관할 법에 따라 <strong>열람·정정·삭제·이동</strong> 요청, 처리 제한, 이의, 감독기관 민원 등 권리를 가질 수
                있습니다. 문의: 아래 이메일.
              </p>
            </section>
            <section className="space-y-2">
              <h3 className="text-base font-semibold">10. 아동</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                만 16세 미만(또는 국가별 기준) 아동을 대상으로 하지 않으며, 고의로 아동의 개인정보를 수집하려 하지
                않습니다. 해당 사실이 확인되면 삭제에 노력합니다.
              </p>
            </section>
            <section className="space-y-2">
              <h3 className="text-base font-semibold">11. 제3자 링크</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                외부 사이트는 각자의 정책이 적용되며, 당사는 그에 대해 통제권이 없습니다.
              </p>
            </section>
            <section className="space-y-2">
              <h3 className="text-base font-semibold">12. 정책 변경</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                본 정책을 개정할 수 있으며, 게시·시행일을 갱신합니다. 법이 허용하는 범위에서 지속 이용은 변경에 동의한
                것으로 볼 수 있습니다.
              </p>
            </section>
            <section className="space-y-2">
              <h3 className="text-base font-semibold">13. 문의</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                개인정보 관련 문의:{" "}
                <a href="mailto:admin.hojujobs@gmail.com" className="text-primary font-medium hover:underline">
                  admin.hojujobs@gmail.com
                </a>
              </p>
            </section>
          </section>

          <section lang="en" className="mt-10 space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              This Privacy Policy explains how <strong className="text-foreground/90">Hoju Jobs</strong> (&quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;) collects, uses, discloses, and protects information when you use our website and services (the
              &quot;Service&quot;). By using the Service, you agree to this policy. If you do not agree, please do not use the
              Service.
            </p>

            <section className="space-y-3" aria-labelledby="e-p1">
              <h3 id="e-p1" className="text-base font-semibold">
                1. Information we collect
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We may collect the following types of information, depending on how you use the Service:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 leading-relaxed">
                <li>
                  <strong>Account and profile (Google sign-in):</strong> When you sign in with Google, we may receive your
                  name, email address, and profile image as made available by Google, solely to create and manage your
                  account.
                </li>
                <li>
                  <strong>Content you provide:</strong> Text and details you include in job listings or when contacting us
                  (for example, job titles, locations, and descriptions).
                </li>
                <li>
                  <strong>Usage and device data:</strong> Basic technical information such as browser type, device type, and
                  general log data, which helps us maintain security and understand how the Service is used.
                </li>
              </ul>
            </section>

            <section className="space-y-3" aria-labelledby="e-p2">
              <h3 id="e-p2" className="text-base font-semibold">
                2. How we use information
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">We use information to:</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 leading-relaxed">
                <li>Provide, operate, and improve the job board and related features</li>
                <li>Authenticate you and keep your account secure</li>
                <li>Communicate with you about your account, listings, or support requests</li>
                <li>Enforce our Terms, prevent fraud or abuse, and comply with legal obligations</li>
                <li>Generate aggregate or de-identified statistics that do not identify you</li>
              </ul>
            </section>

            <section className="space-y-3" aria-labelledby="e-p3">
              <h3 id="e-p3" className="text-base font-semibold">
                3. Legal bases (where applicable)
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Depending on your location, we may rely on <strong>contractual necessity</strong> (to provide the Service),{" "}
                <strong>legitimate interests</strong> (security, analytics, product improvement) balanced against your
                rights, and <strong>consent</strong> where required (for example, certain cookies or marketing, if we add
                them in the future). Where we ask for consent, you may withdraw it as described in this policy.
              </p>
            </section>

            <section className="space-y-3" aria-labelledby="e-p4">
              <h3 id="e-p4" className="text-base font-semibold">
                4. Cookies and similar technologies
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use cookies and local storage as needed for authentication, session management, and core site
                functionality. We do not use third-party advertising cookies for cross-site tracking. If our practices change
                in a material way, we will update this policy.
              </p>
            </section>

            <section className="space-y-3" aria-labelledby="e-p5">
              <h3 id="e-p5" className="text-base font-semibold">
                5. Service providers
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use trusted infrastructure providers. For example, <strong>Supabase</strong> may store and process data
                you submit through the Service, and <strong>Google</strong> processes sign-in as described in their terms and
                privacy notice. We only share data with providers as needed to run the Service and under appropriate
                safeguards.
              </p>
            </section>

            <section className="space-y-3" aria-labelledby="e-p6">
              <h3 id="e-p6" className="text-base font-semibold">
                6. Data retention
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We keep information for as long as your account is active or as needed to provide the Service, comply with
                law, resolve disputes, and enforce our agreements. When you delete your account, we will delete or
                anonymize personal information where we can, subject to legal retention requirements.
              </p>
            </section>

            <section className="space-y-3" aria-labelledby="e-p7">
              <h3 id="e-p7" className="text-base font-semibold">
                7. International transfers
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our service providers may process data in countries other than where you live. We take steps designed to
                protect your information in line with this policy and applicable law.
              </p>
            </section>

            <section className="space-y-3" aria-labelledby="e-p8">
              <h3 id="e-p8" className="text-base font-semibold">
                8. Security
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use administrative, technical, and organizational measures appropriate to the nature of the Service. No
                method of transmission over the Internet is 100% secure; we cannot guarantee absolute security.
              </p>
            </section>

            <section className="space-y-3" aria-labelledby="e-p9">
              <h3 id="e-p9" className="text-base font-semibold">
                9. Your rights
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Depending on your jurisdiction, you may have the right to access, correct, delete, or port your personal
                data, or to object to or restrict certain processing. You may also have the right to complain to a data
                protection authority. To exercise your rights, contact us using the details below. We will respond in line
                with applicable law.
              </p>
            </section>

            <section className="space-y-3" aria-labelledby="e-p10">
              <h3 id="e-p10" className="text-base font-semibold">
                10. Children
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Service is not directed to children under 16 (or the age required in your country). We do not knowingly
                collect personal information from children. If you believe a child has provided us data, please contact us
                and we will take appropriate steps to delete it.
              </p>
            </section>

            <section className="space-y-3" aria-labelledby="e-p11">
              <h3 id="e-p11" className="text-base font-semibold">
                11. Third-party sites
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Service may contain links to third-party websites. We are not responsible for their privacy practices.
                Please read their policies before you share information.
              </p>
            </section>

            <section className="space-y-3" aria-labelledby="e-p12">
              <h3 id="e-p12" className="text-base font-semibold">
                12. Changes
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will post the updated version on this page.
                Continued use of the Service after changes means you accept the
                updated policy, to the extent permitted by law.
              </p>
            </section>

            <section className="space-y-3" aria-labelledby="e-p13">
              <h3 id="e-p13" className="text-base font-semibold">
                13. Contact
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For privacy-related requests or questions:{" "}
                <a href="mailto:admin.hojujobs@gmail.com" className="text-primary font-medium hover:underline">
                  admin.hojujobs@gmail.com
                </a>
              </p>
            </section>
          </section>
        </div>
      </div>
    </div>
  );
}
