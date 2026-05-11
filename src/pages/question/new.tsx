import { useState } from "react";
import Title from "../../components/Title";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Editor from "../../components/ui/Editor";
import CategorySelectDropdown from "../../components/ui/CategorySelectDropdown";
import { QuestionService } from "../../services/question";
import { useNavigate } from "react-router";

export type QuestionFormInputs = {
    title: string;
    content: string;
    answer: string;
    isPublic: boolean;
    limitedMinute: number;
    categoryId?: number;
};

const DEFAULT_INPUTS: QuestionFormInputs = {
    title: '',
    content: '',
    answer: '',
    isPublic: true,
    limitedMinute: 0,
    categoryId: undefined,
};

type Props = {
    initialInputs?: Partial<QuestionFormInputs>;
    initialCategoryLabel?: string;
    onSubmit?: (inputs: QuestionFormInputs) => Promise<void> | void;
};


function QuestionNew({ initialInputs, initialCategoryLabel, onSubmit }: Props) {
    const isEdit = !!initialInputs;
    const navigate = useNavigate();

    async function handleSubmit(inputs: QuestionFormInputs) {
        if (onSubmit) {
            await onSubmit(inputs);
        } else {
            await QuestionService.create({ ...inputs });
            alert('성공적으로 등록되었습니다.');
            navigate('/question');
        }
    }

    const [inputs, setInputs] = useState<QuestionFormInputs>({
        ...DEFAULT_INPUTS,
        ...initialInputs,
    });

    function set<K extends keyof QuestionFormInputs>(key: K, value: QuestionFormInputs[K]) {
        setInputs(prev => ({ ...prev, [key]: value }));
    }

    return <>
        <Title
            title={isEdit ? '질문 수정' : '질문 등록'}
            subTitle="심도 있고 정교한 학습 콘텐츠를 구성해 보세요."
        />
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 space-y-6">
                <div className="flex flex-col gap-2">
                    <label className="block text-xs font-bold text-on-surface px-1">문제 제목</label>
                    <Input inputSize="large" placeholder="문제명을 입력해주세요." type="text" value={inputs.title} onChange={e => set('title', e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="block text-xs font-bold text-on-surface px-1">문제 내용</label>
                    <Editor content={inputs.content} onChange={v => set('content', v)} />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="block text-xs font-bold text-on-surface px-1">정답</label>
                    <Editor content={inputs.answer} onChange={v => set('answer', v)} />
                </div>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="bg-surface-container-low rounded-2xl p-6 space-y-8">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-4">카테고리 선택</label>
                <CategorySelectDropdown
                    value={inputs.categoryId}
                    onChange={(id) => set('categoryId', id)}
                    initialLabel={initialCategoryLabel}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-bold text-on-surface mb-2"
                  >상위 문제 연결 (선택 사항)</label>
                <div className="relative mb-3">
                  <input
                    className="w-full bg-surface-container-lowest border-0 rounded-xl py-4 pl-12 pr-4 text-sm font-semibold text-on-surface focus:ring-2 focus:ring-primary/20 transition-all shadow-sm placeholder:text-outline-variant"
                    placeholder="문제 제목 검색..."
                    type="text"
                  />
                  <span
                    className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
                </div>
                <p
                  className="text-[11px] text-on-surface-variant/80 leading-relaxed px-1"
                >
                  이 문제는 특정 질문에 대한 꼬리물기 질문인가요? 상위 문제를
                  선택하여 계층 구조를 만드세요.
                </p>
              </div>
              <div>
                <label
                  className="block text-xs font-bold text-on-surface mb-4"
                  >태그</label>
                <div className="flex flex-wrap gap-2">
                  <span
                    className="px-3 py-1 bg-primary-fixed text-on-primary-fixed text-[11px] font-bold rounded-full"
                    >#L7_스태프</span>
                  <span
                    className="px-3 py-1 bg-surface-container-highest text-on-surface-variant text-[11px] font-bold rounded-full hover:bg-primary-fixed-dim cursor-pointer transition-colors"
                    >#확장성</span>
                  <span
                    className="px-3 py-1 bg-surface-container-highest text-on-surface-variant text-[11px] font-bold rounded-full hover:bg-primary-fixed-dim cursor-pointer transition-colors"
                    >+ 태그 추가</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-4">제한 시간 (분)</label>
                <Input
                  type="number"
                  placeholder="0 = 제한 없음"
                  value={inputs.limitedMinute === 0 ? '' : String(inputs.limitedMinute)}
                  onChange={e => set('limitedMinute', Number(e.target.value) || 0)}
                  wrapperClassName="!bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-4">공개 설정</label>
                <div className="flex rounded-xl overflow-hidden bg-surface-container-high p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => set('isPublic', true)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${inputs.isPublic ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">public</span>
                    공개
                  </button>
                  <button
                    type="button"
                    onClick={() => set('isPublic', false)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${!inputs.isPublic ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">lock</span>
                    비공개
                  </button>
                </div>
              </div>

              <div className="bg-surface-container-high rounded-xl p-4">
                <div className="flex gap-3">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                    >info</span>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    <span className="font-bold text-primary">비공개</span>로 설정된
                    문제는 개인 보관함에만 저장되며 커뮤니티 라이브러리에는
                    노출되지 않습니다.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Button variant="primary" className="w-full justify-center" onClick={() => handleSubmit(inputs)}>
                  <span className="material-symbols-outlined">save</span>
                  저장하기
                </Button>
                <Button variant="secondary" className="w-full justify-center">
                  <span className="material-symbols-outlined">close</span>
                  취소
                </Button>
            </div>
            </div>
            </div>
        </div>
    </>
}

export default QuestionNew;
