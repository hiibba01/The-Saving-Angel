import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        taskType: {
            type: String,
            enum: ["Personal", "Team"],
            required: true,
            default: "Personal",
    },
        priority: {
            type: String,
            enum: ["On Track", "Needs Focus", "Deadline Alert"],
            default: "On Track"
        },
        status: {
            type: String,
            enum: ["Pending", "In Progress", "Completed"],
            default: "Pending"
        },
        dueDate: {
            type: Date,
            required: true,
        },
        assignedTo: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            
        }],
        createdBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }],
        attachments: [
            {
                type: String,
            }
        ],
        todoCheckList: [todoSchema],

        progress: {
            type: Number,
            default: 0
        }
    }, { timestamps: true }
)

const Task = mongoose.model("Task", taskSchema);
export default Task;