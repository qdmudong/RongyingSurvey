import Link from "next/link";

export default function Home() {
  return (
    <main className="home-shell">
      <section>
        <p className="eyebrow">Rongying Survey</p>
        <h1>测评系统</h1>
        <p>用于发布移动端自我测评、收集提交结果，并在后台查看与导出数据。</p>
        <div className="home-actions">
          <Link className="primary-link" href="/s/satir-coping">
            进入萨提亚测评
          </Link>
          <Link className="secondary-link" href="/admin">
            管理后台
          </Link>
        </div>
      </section>
    </main>
  );
}
