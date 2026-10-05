import { classNames } from "@/utils/common";

const CategoryCard = ({
  id,
  name,
  currentCategory,
  setCurrentCategory,
  setCategoryData,
  categoryData,
  styleCatalog,
  setData
}: {
  id: number;
  name: string;
  currentCategory: any;
  setCurrentCategory: any;
  styleCatalog?: any;
  setCategoryData: any;
  categoryData: any;
  setData?: any
}) => {
  return (
    <div
      className={classNames(
        currentCategory === id ? "bg-blue-700 text-white" : "",
        `cursor-pointer rounded-full ${
          styleCatalog ? "ml-1 mr-3 px-2" : "px-4"
        } whitespace-nowrap py-1 text-sm font-medium`
      )}
      onClick={() => {
        setCurrentCategory(id);
        const newArr: number[] = []
        if (id > 0) {
          newArr.push(id)
        }
        setCategoryData({...categoryData, category: newArr, page: 1});
        setData([])
      }}
    >
      {name}
    </div>
  );
};

export default CategoryCard;
