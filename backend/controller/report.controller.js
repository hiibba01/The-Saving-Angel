import Task from "../models/task.model.js";
import exceljs from "exceljs";

export const exportTaskReport = async(req, res, next)=> {
    try {
        const tasks = await  Task.find().populate("assignedTo", "name email");

        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet("Tasks Report");

        worksheet.columns = [
            {header: "Task Id", key: "_id", width: 25},
            {header: "Title", key: "title", width: 30},
            {header: "Description", key: "description", width: 50},
            {header: "Priority", key: "priority", width: 15},
            {header: "Status", key: "status", width: 20},
            {header: "Due Date", key: "dueDate", width: 20},
            {header: "Assigned To", key: "assignedTo", width: 30}
        ]
        
        Task.forEach((task) => {
            const assignedTo = task.assignedTo.map(
                (user) => `${user.name} (${user.email})`
            ).join(", ")

            worksheet.addRow({
                _id: task.id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
                dueDate: task.dueDate.toISOString().split("T")[0],
                assignedTo: assignedTo || "Unassigned"

            })
        })

        res.setHeader(
            "Content-Type",
            "attachment/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="tasks_report.xlsx"'
        )

        return workbook.xlsx.write(res).then(()=>{
            res.end();
        })
    } catch (error) {
        next(error);
    }
    
}