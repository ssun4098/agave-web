import { useState, useEffect } from "react";
import { NavLink } from "react-router";
import Title from "../../components/Title";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import WorkbookTable from "../../components/ui/WorkbookTable";
import { WorkbookService } from "../../services/workbook";
import type { WorkbookSummary } from "../../types/workbook";

const PAGE_SIZE = 10;

function MyWorkbookList() {
    const [items, setItems] = useState<WorkbookSummary[]>([]);
    const [page, setPage] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTitle, setSearchTitle] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        WorkbookService.myList({ title: searchTitle || undefined, page: page - 1, size: PAGE_SIZE })
            .then(res => {
                if (res.data) {
                    setItems(res.data.content);
                    setTotalElements(res.data.totalElements);
                    setTotalPages(res.data.totalPages);
                }
            });
    }, [page, searchTitle, refreshKey]);

    return <>
        <Title title="문제집 관리" subTitle="등록된 문제집 목록입니다" actions={
            <NavLink to="/workbook/new">
                <Button variant="primary">
                    <span className="material-symbols-outlined">add</span>
                    등록하기
                </Button>
            </NavLink>
        } />
        <div className="flex flex-col gap-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <Input
                    wrapperClassName="flex-1"
                    icon="search"
                    placeholder="이름으로 검색..."
                    type="text"
                    value={searchTitle}
                    onChange={e => { setSearchTitle(e.target.value); setPage(1); }}
                />
            </div>
        </div>
        <WorkbookTable
            items={items}
            totalElements={totalElements}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onRefresh={() => setRefreshKey(k => k + 1)}
        />
    </>;
}

export default MyWorkbookList;
