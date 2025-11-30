import React from 'react';
import { Check, X, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Answer {
  id: number;
  text: string;
  isCorrect: boolean;
  orderIdx: number;
}

interface Question {
  id: number;
  text: string;
  type: 'multi' | 'single' | 'true_false' | 'fill_blank';
  isPrivate: boolean;
}

interface QuestionCardProps {
  question: Question;
  answers: Answer[];
  onAdd?: () => void;
  isAdding?: boolean;
  showAddButton?: boolean;
}

const questionTypeLabels: Record<string, string> = {
  single: 'Single Choice',
  multi: 'Multiple Choice',
  true_false: 'True/False',
  fill_blank: 'Fill in Blank',
};

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  answers,
  onAdd,
  isAdding = false,
  showAddButton = false,
}) => {
  const correctAnswers = answers.filter((a) => a.isCorrect);

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 border border-gray-100 flex flex-col h-full">
      <div className="px-4 py-5 sm:p-6 flex-grow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-indigo-600">
            <HelpCircle className="h-5 w-5 mr-2" />
          </div>
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            {questionTypeLabels[question.type]}
          </span>
        </div>

        <h3 className="text-base font-medium text-gray-900 mb-4 line-clamp-2">{question.text}</h3>

        {/* Answers Section */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {question.type === 'fill_blank' ? 'Correct Answer:' : 'Answer Options:'}
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {answers.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No answers available</p>
            ) : (
              answers
                .sort((a, b) => a.orderIdx - b.orderIdx)
                .map((answer) => (
                  <div
                    key={answer.id}
                    className={`flex items-start gap-2 p-2 rounded-md text-sm ${
                      answer.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {answer.isCorrect ? (
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={answer.isCorrect ? 'text-green-900 font-medium' : 'text-gray-700'}>
                      {answer.text}
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Correct Answer Summary for Multiple Choice */}
        {(question.type === 'single' || question.type === 'multi') && correctAnswers.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-medium text-green-700">
              ✓ {correctAnswers.length} correct answer{correctAnswers.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {showAddButton && (
        <div className="bg-gray-50 px-4 py-4 sm:px-6">
          <Button variant="primary" className="w-full" onClick={onAdd} isLoading={isAdding} disabled={isAdding}>
            Add to Topic
          </Button>
        </div>
      )}
    </div>
  );
};
