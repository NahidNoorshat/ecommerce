// components/dashbordcard/DashbordCard.jsx
const DashbordCard = ({ icon, title, value }) => {
  return (
    <div className="bg-white dark:bg-slate-600 p-6 rounded-xl shadow-md overflow-hidden w-full">
      <div className="flex items-center justify-between w-full">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {/* Icon with background */}
        <div className="p-3 bg-green-100 rounded-full">
          <div className="text-2xl text-green-500">{icon}</div>
        </div>
      </div>
    </div>
  );
};

export default DashbordCard;
