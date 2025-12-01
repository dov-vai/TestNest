import { TopicList } from '@/components/topics/TopicList';

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block">Master your knowledge</span>
          <span className="block text-primary-600">with TestNest</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Create, share, and take tests to improve your learning. Browse our public collection or sign in to create your
          own.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Available Topics</h2>
        </div>
        <TopicList />
      </div>
    </div>
  );
}
