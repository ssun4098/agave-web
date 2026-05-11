import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import WorkbookNew from "../new";
import { WorkbookService } from "../../../services/workbook";
import type { WorkbookFormInputs, SelectedQuestion } from "../new";

function WorkbookEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [initialInputs, setInitialInputs] = useState<Partial<WorkbookFormInputs> | null>(null);
    const [initialQuestions, setInitialQuestions] = useState<SelectedQuestion[]>([]);

    useEffect(() => {
        if (!id) return;
        WorkbookService.myDetail(Number(id)).then(res => {
            if (!res.data) return;
            const { name, content, public: isPublic, questions } = res.data;
            setInitialInputs({
                name,
                content,
                public: isPublic,
                questions: questions.map(q => q.id),
            });
            setInitialQuestions(
                [...questions]
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map(q => ({ id: q.id, title: q.name }))
            );
        });
    }, [id]);

    async function handleSubmit(inputs: WorkbookFormInputs) {
        await WorkbookService.update(Number(id), inputs);
        alert('성공적으로 수정되었습니다.');
        navigate('/workbook');
    }

    if (!initialInputs) return null;

    return (
        <WorkbookNew
            initialInputs={initialInputs}
            initialQuestions={initialQuestions}
            onSubmit={handleSubmit}
        />
    );
}

export default WorkbookEdit;
