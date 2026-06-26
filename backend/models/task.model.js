import mongoose from "mongoose";

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
      enum: ["Easy Win", "Focus Task", "Mission Critical"],
      default: "Easy Win"
},

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },

    dueDate: {
      type: Date,
      required: true,
    },

    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    attachments: [
      {
        type: String,
      },
    ],

    todoCheckList: [todoSchema],

    progress: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Validation for Team tasks must have at least one assigned member
taskSchema.pre("save", function (next) {
  if (
    this.taskType === "Team" &&
    (!this.assignedTo || this.assignedTo.length === 0)
  ) {
    return next(
      new Error("Please assign at least one member to a Team task.")
    );
  }

  next();
});

const Task = mongoose.model("Task", taskSchema);

export default Task;