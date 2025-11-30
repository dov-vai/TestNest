import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { BookOpen, Lock, Unlock } from 'lucide-react';

interface Topic {
  id: number;
  title: string;
  description?: string;
  isPrivate: boolean;
}

interface TopicCardProps {
  topic: Topic;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 border border-gray-100 flex flex-col h-full">
      <div className="px-4 py-5 sm:p-6 flex-grow">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center text-primary-600">
            <BookOpen className="h-5 w-5 mr-2" />
            {topic.isPrivate ? (
              <Lock className="h-4 w-4 text-gray-400" />
            ) : (
              <Unlock className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">{topic.title}</h3>
        <p className="mt-2 text-sm text-gray-500 line-clamp-3">{topic.description || 'No description provided.'}</p>
      </div>
      <div className="bg-gray-50 px-4 py-4 sm:px-6">
        <Link href={`/topics/${topic.id}`} className="w-full">
          <Button variant="primary" className="w-full">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
};
