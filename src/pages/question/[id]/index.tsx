import { useState, useEffect } from "react";
import Title from "../../../components/Title";
import Button from "../../../components/ui/Button";
import { QuestionService } from "../../../services/question";
import { useParams, useNavigate } from "react-router";

function ProblemDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [question, setQuestion] = useState({
        title: '',
        content: '',
        answer: '',
        isPublic: true,
        limitedMinute: 0,
        category: {
            id: 0,
            name: '',
            icon: ''
        }
    });

    useEffect(() => {
        QuestionService.getMyDetail(Number(id)).then(response => {
            if (response.data) setQuestion(response.data);
        });
    }, [id]);

    async function handleDelete() {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        await QuestionService.delete(Number(id));
        navigate('/question');
    }

    const category = '시스템 아키텍처';
    const tags = ['#L7_스태프', '#확장성', '#분산시스템'];

    return <>
        <div className="flex items-center justify-between">
            <Title title={question.title} subTitle="" />
            <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => navigate('/question')}>
                    <span className="material-symbols-outlined">arrow_back</span>
                    뒤로가기
                </Button>
                <Button variant="secondary" onClick={() => navigate(`/question/${id}/edit`)}>
                    <span className="material-symbols-outlined">edit</span>
                    수정
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                    <span className="material-symbols-outlined">delete</span>
                    삭제
                </Button>
            </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold ${question.isPublic ? 'bg-primary/10 text-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                <span className="material-symbols-outlined text-[14px]">{question.isPublic ? 'public' : 'lock'}</span>
                {question.isPublic ? '공개' : '비공개'}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-surface-container-highest text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]">category</span>
                {question.category.name}
            </span>
            {tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full text-[11px] font-bold bg-primary-fixed text-on-primary-fixed">{tag}</span>
            ))}
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-surface-container-highest text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]">timer</span>
                {question.limitedMinute > 0 ? `${question.limitedMinute}분` : '제한 없음'}
            </span>
        </div>
        <div className="grid grid-cols-12 gap-8 mt-6">
            <div className="col-span-12 space-y-6">
                <div className="bg-surface-container-low rounded-2xl p-6">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-4">문제 내용</h2>
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: question.content }} />
                </div>
                <div className="bg-surface-container-low rounded-2xl p-6">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-4">정답</h2>
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: question.answer }} />
                </div>
            </div>
        </div>
    </>
}

export default ProblemDetail