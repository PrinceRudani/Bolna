import DateSelector from "../components/Home/DateSelector";
import DepartmentGrid from "../components/Home/DepartmentGrid";
import TopHeader from "../components/Home/TopHeader";

const HomeDashboard = () => {
    return (
        <div className="p-6 lg:p-8">
            <TopHeader />
            <DateSelector />
            <DepartmentGrid />
        </div>
    );
};


export default HomeDashboard;