import Link from "next/link";
import { Button, Card, Badge } from "../../components";

export default function Apps() {
  return (
    <div className="font-sans min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 items-center">
        <Card className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">내 앱들</h1>
          <p className="text-lg text-center mb-6">
            제가 개발한 iOS, Android, 웹 앱들을 소개합니다. 각 앱을 다운로드하거나 사용해 보세요.
          </p>
          <Button as={Link} href="/upload-app" variant="primary">
            + 새 앱 업로드
          </Button>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Placeholder for app items */}
          <Card
            title="앱 1"
            actions={<Badge variant="default">웹</Badge>}
          >
            <p className="text-gray-600 mb-4">앱 1의 설명입니다.</p>
            <div className="flex gap-2">
              <Button as={Link} href="#" variant="outline" size="sm">
                다운로드
              </Button>
              <Button as={Link} href="/apps/app1" variant="success" size="sm">
                자세히 보기
              </Button>
            </div>
          </Card>
          <Card
            title="앱 2"
            actions={<Badge variant="info">iOS</Badge>}
          >
            <p className="text-gray-600 mb-4">앱 2의 설명입니다.</p>
            <div className="flex gap-2">
              <Button as={Link} href="#" variant="outline" size="sm">
                다운로드
              </Button>
              <Button as={Link} href="/apps/app2" variant="success" size="sm">
                자세히 보기
              </Button>
            </div>
          </Card>
          <Card
            title="앱 3"
            actions={<Badge variant="warning">Android</Badge>}
          >
            <p className="text-gray-600 mb-4">앱 3의 설명입니다.</p>
            <div className="flex gap-2">
              <Button as={Link} href="#" variant="outline" size="sm">
                다운로드
              </Button>
              <Button as={Link} href="/apps/app3" variant="success" size="sm">
                자세히 보기
              </Button>
            </div>
          </Card>
        </div>

        <Button as={Link} href="/" variant="outline">
          홈으로 돌아가기
        </Button>
      </main>
    </div>
  );
}
