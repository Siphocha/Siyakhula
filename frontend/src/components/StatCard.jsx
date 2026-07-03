function StatCard({
    title,
    value
}) {

    return (

        <div className="bg-white p-6 rounded-xl shadow">

            <h3 className="text-slate-500 mb-2">
                {title}
            </h3>

            <h2 className="text-3xl font-bold">
                {value}
            </h2>

        </div>

    );
}

export default StatCard;