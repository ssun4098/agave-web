import { useState, useEffect } from "react";
import QuestionNew from "../new";
import type { QuestionFormInputs } from "../new";
import { QuestionService } from "../../../services/question";
import { useParams, useNavigate } from "react-router";

function QuestionEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [initialInputs, setInitialInputs] = useState<QuestionFormInputs | null>(null);
    const [initialCategoryLabel, setInitialCategoryLabel] = useState<string | undefined>();

    useEffect(() => {
        QuestionService.getMyDetail(Number(id)).then(response => {
            if (response.data) {
                const { title, content, answer, isPublic, limitedMinute, category } = response.data;
                setInitialInputs({ title, content, answer, isPublic, limitedMinute, categoryId: category?.id });
                if (category) setInitialCategoryLabel(`${category.icon} ${category.name}`);
            }
        });
    }, [id]);

    async function handleSubmit(inputs: QuestionFormInputs) {
        await QuestionService.update(Number(id), { ...inputs });
        alert('수정되었습니다.');
        navigate(`/question/${id}`);
    }

    if (!initialInputs) return null;

    return <QuestionNew initialInputs={initialInputs} initialCategoryLabel={initialCategoryLabel} onSubmit={handleSubmit} />;
}

export default QuestionEdit;
