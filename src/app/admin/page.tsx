import QRCode from "qrcode";
import { headers } from "next/headers";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/auth";
import { asArray } from "@/lib/json";
import { prisma } from "@/lib/prisma";
import type { DimensionScore, SurveyResult } from "@/lib/satir";
import { ensureBuiltinSurveys } from "@/lib/surveys";

type AdminPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const authed = await isAdminAuthenticated();
  const { error } = await searchParams;

  if (!authed) {
    return (
      <main className="admin-login">
        <form action="/api/admin/login" method="post" className="login-card">
          <h1>管理后台</h1>
          <p>请输入管理员密码。</p>
          {error && <div className="form-error">密码不正确。</div>}
          <input type="password" name="password" placeholder="管理员密码" autoComplete="current-password" />
          <button className="primary-button" type="submit">
            登录
          </button>
          <small>本地默认密码为 admin123，部署时请设置 ADMIN_PASSWORD。</small>
        </form>
      </main>
    );
  }

  await ensureBuiltinSurveys();

  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;
  const surveys = await prisma.survey.findMany({
    include: {
      submissions: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const qrCodes = new Map<string, string>();
  for (const survey of surveys) {
    qrCodes.set(survey.id, await QRCode.toDataURL(`${origin}/s/${survey.slug}`, { width: 280, margin: 1 }));
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p>Rongying Survey</p>
          <h1>管理后台</h1>
        </div>
        <form action="/api/admin/logout" method="post">
          <button className="ghost-button" type="submit">
            退出
          </button>
        </form>
      </header>

      {surveys.map((survey) => {
        const surveyUrl = `${origin}/s/${survey.slug}`;
        return (
          <section className="admin-section" key={survey.id}>
            <div className="survey-admin-head">
              <div>
                <h2>{survey.title}</h2>
                <Link href={surveyUrl}>{surveyUrl}</Link>
              </div>
              <a className="primary-link" href={`/api/admin/submissions/export?surveyId=${survey.id}`}>
                导出 CSV
              </a>
            </div>

            <div className="admin-grid">
              <div className="qr-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCodes.get(survey.id)} alt={`${survey.title} QR code`} />
                <span>扫码进入测评</span>
              </div>

              <div className="submission-panel">
                <h3>最近提交</h3>
                {survey.submissions.length === 0 ? (
                  <p className="empty-text">暂无提交记录。</p>
                ) : (
                  <div className="submission-list">
                    {survey.submissions.map((submission) => {
                      const result = submission.result as unknown as SurveyResult;
                      const scores = asArray<DimensionScore>(result.scores);
                      return (
                        <div className="submission-row" key={submission.id}>
                          <div>
                            <strong>{submission.respondent}</strong>
                            <span>{submission.createdAt.toLocaleString("zh-CN")}</span>
                          </div>
                          <p>
                            主导姿态：{result.dominant}
                            {" / "}
                            {scores.map((score) => `${score.name} ${score.average.toFixed(2)}`).join("，")}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}
    </main>
  );
}
