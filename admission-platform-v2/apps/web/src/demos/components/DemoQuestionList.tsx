import { DemoQuestionCard } from './DemoQuestionCard';

interface Section {
  name: string;
  questions: {
    id: string;
    text: string;
    options: string[];
    correctAnswer: string;
    studentAnswer: string | null;
    isCorrect: boolean;
    timeSpent: number;
    difficulty: string;
  }[];
  stats: { total: number; correct: number; wrong: number; unanswered: number };
}

interface QuestionListProps {
  sections: Section[];
  visibleSections: number;
  expandedQuestions: Set<string>;
}

export function DemoQuestionList({ sections, visibleSections, expandedQuestions }: QuestionListProps) {
  let questionCounter = 0;

  return (
    <div className="space-y-6">
      {sections.slice(0, visibleSections).map((section, si) => (
        <div key={section.name} className="demo-animate-fadeInUp" style={{ animationDelay: `${si * 200}ms` }}>
          {/* Section header */}
          <div className="bg-gradient-to-r from-[#00a666] to-green-600 rounded-xl px-5 py-3 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-white font-bold text-lg">{section.name}</span>
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{section.stats.total} questions</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-green-100">
              <span>\u2713 {section.stats.correct}/{section.stats.total}</span>
              {section.stats.wrong > 0 && <span>\u2717 {section.stats.wrong}</span>}
              {section.stats.unanswered > 0 && <span>- {section.stats.unanswered}</span>}
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-3 pl-2">
            {section.questions.map((q) => {
              questionCounter++;
              return (
                <DemoQuestionCard
                  key={q.id}
                  questionNumber={questionCounter}
                  text={q.text}
                  options={q.options}
                  correctAnswer={q.correctAnswer}
                  studentAnswer={q.studentAnswer}
                  isCorrect={q.isCorrect}
                  timeSpent={q.timeSpent}
                  difficulty={q.difficulty}
                  section={section.name}
                  isExpanded={expandedQuestions.has(q.id)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
