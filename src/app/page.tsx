import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            短劇工廠
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI 驅動的短視頻創作平台，從創意到成片一站完成
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/creative"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-indigo-700"
            >
              開始創作
            </Link>
            <Link
              href="/projects"
              className="bg-white text-indigo-600 border border-indigo-600 px-6 py-3 rounded-lg text-lg hover:bg-indigo-50"
            >
              查看項目
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">AI 故事生成</h3>
            <p className="text-gray-600">輸入主題，AI 自動生成故事大綱和劇本</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">智能分鏡</h3>
            <p className="text-gray-600">自動拆分劇本，生成專業分鏡規格</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">人物生成</h3>
            <p className="text-gray-600">基於描述生成一致風格的人物圖像</p>
          </div>
        </div>
      </div>
    </div>
  );
}
