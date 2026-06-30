import Task from "../models/task.model.js";
import { errorHandler } from "../utils/error.js";

export const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            taskType,
            priority,
            dueDate,
            assignedTo,
            attachments,
            todoCheckList
        } = req.body;

        if (!title || !dueDate) {
            return res.status(400).json({
                success: false,
                message: "Title and Due Date are required."
            });
        }

        if (taskType === "Personal") {
            const task = await Task.create({
                title,
                description,
                taskType: "Personal",
                priority,
                dueDate,
                assignedTo: [req.user.id],
                attachments,
                todoCheckList,
                createdBy: req.user.id
            });

            return res.status(201).json({
                message: "Task created successfully!",
                task
            });
        }

        else if (taskType === "Team") {
            if (req.user.role !== "admin") {
                return res.status(403).json({
                    success: false,
                    message: "Only admins can create Team tasks."
                });
            }

            if (!assignedTo || assignedTo.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Please assign at least one team member."
                });
            }

            const task = await Task.create({
                title,
                description,
                taskType: "Team",
                priority,
                dueDate,
                assignedTo,
                attachments,
                todoCheckList,
                createdBy: req.user.id,
            });

            return res.status(201).json({
                message: "Task Created Successfully!",
                task
            });
        }

        else{
            return res.status(400).json({
            success: false,
            message: "Invalid task type."
        });
        }

    } catch (error) {
        next(error)
    }
};

export const getTasks = async (req, res, next) => {
  try {
    let filter = {};

    // Filter according to user role
    if (req.user.role === "admin") {
      filter = {
        $or: [
          {
            taskType: "Personal",
            createdBy: req.user.id,
          },
          {
            taskType: "Team",
          },
        ],
      };
    } else {
      filter = {
        $or: [
          {
            taskType: "Personal",
            createdBy: req.user.id,
          },
          {
            taskType: "Team",
            assignedTo: req.user.id,
          },
        ],
      };
    }

    // Fetch tasks
    let tasks = await Task.find(filter)
      .populate("assignedTo", "name email profileImageUrl")
      .populate("createdBy", "name");

    // Add completed todo count
    tasks = await Promise.all(
      tasks.map(async (task) => {
        const completedCount = task.todoCheckList.filter(
          (item) => item.completed
        ).length;

        return {
          ...task._doc,
          completedCount,
        };
      })
    );

    // Status summary
    const allTasks = await Task.countDocuments(filter);

    const pendingTasks = await Task.countDocuments({
      ...filter,
      status: "Pending",
    });

    const inProgressTasks = await Task.countDocuments({
      ...filter,
      status: "In Progress",
    });

    const completedTasks = await Task.countDocuments({
      ...filter,
      status: "Completed",
    });

    res.status(200).json({
      success: true,
      tasks,
      statusSummary: {
        all: allTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};



export const getTaskById = async (req, res, next) => {
    try {

        const task = await Task.findById(req.params.id)
            .populate("assignedTo", "name email profileImageUrl")
            .populate("createdBy", "name email");

        if (!task) {
            return next(errorHandler(404, "Task not found!"));
        }

        // Admin
        if (req.user.role === "admin") {

            if (
                task.taskType === "Team" ||
                task.createdBy._id.toString() === req.user.id
            ) {
                return res.status(200).json(task);
            }

            return next(errorHandler(403, "Access denied."));
        }

        // Normal User

        const isCreator =
            task.createdBy._id.toString() === req.user.id;

        const isAssigned =
            task.assignedTo.some(
                user => user._id.toString() === req.user.id
            );

        if (isCreator || isAssigned) {
            return res.status(200).json(task);
        }

        return next(errorHandler(403, "Access denied!"));

    } catch (error) {
        next(error);
    }
};

export const updateTask = async (req, res, next) => {

    try {

        const task = await Task.findById(req.params.id);

        if (!task) {
            return next(errorHandler(404, "Task not found!"));
        }

        // PERSONAL TASK
        if (task.taskType === "Personal") {

            if (task.createdBy.toString() !== req.user.id) {

                return next(errorHandler(403,"You can update only your own Personal tasks"));
            }
        }
        // TEAM TASK
        if (
            task.taskType === "Team" &&
            req.user.role !== "admin"
        ) {
            return next(errorHandler(403,"Only admin can update Team tasks!"
            ));
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        return res.status(200).json(updatedTask);
    }    catch (error) {
        next(error);
    }

};

export const deleteTask = async (req, res, next) => {

    try {

        const task = await Task.findById(req.params.id);

        if (!task) {
            return next(errorHandler(404, "Task not found."));
        }
        if (
            task.taskType === "Personal" &&
            task.createdBy.toString() !== req.user.id
        ) {

            return next(errorHandler(403,"You cannot delete this task!"));
        }

        if (
            task.taskType === "Team" &&
            req.user.role !== "admin"
        ) {

            return next(errorHandler(403,"Only admin can delete Team tasks."));
        }
        await task.deleteOne();
        return res.status(200).json({
            success: true,
            message: "Task deleted successfully!"

        });
    }
    catch (error) {
        next(error);
    }
};

export const updateTaskStatus = async (req, res, next) => {

    try {

        const task = await Task.findById(req.params.id);

        if (!task) {

            return next(errorHandler(404, "Task not found."));

        }

        if (task.taskType === "Personal") {

            if (task.createdBy.toString() !== req.user.id) {

                return next(errorHandler(403,"Access denied!."));
            }
        }
        if (task.taskType === "Team") {

            const assigned = task.assignedTo.some(
                id => id.toString() === req.user.id
            );
            if (
                req.user.role !== "admin" &&
                !assigned
            ) {
                return next(errorHandler(403,"Access denied!"));
            }

            if(task.status === "Completed") {
                task.todoCheckList.forEach((item)=> (item.completed = true))
            }
        }
        task.status = req.body.status;
        await task.save();
        return res.status(200).json({message: "Task status updated!", task});
    }
    catch (error) {
        next(error);
    }
};

export const updateTaskCheckList = async (req, res, next) => {
    try {
        const { todoCheckList } = req.body;

        const task = await Task.findById(req.params.id);

        if (!task) {
            return next(errorHandler(404, "Task not found!"));
        }

        // Authorization
        if (req.user.role === "admin") {
            // Admin can update:
            // 1. Any Team task
            // 2. Their own Personal task
            if (
                task.taskType === "Personal" &&
                task.createdBy.toString() !== req.user.id
            ) {
                return next(
                    errorHandler(403, "Not authorized to update checklist!")
                );
            }
        } else {
            // Normal user

            if (task.taskType === "Personal") {
                // User can update only their own personal task
                if (task.createdBy.toString() !== req.user.id) {
                    return next(
                        errorHandler(403, "Not authorized to update checklist!")
                    );
                }
            } else {
                // User can update only assigned team task
                const isAssigned = task.assignedTo.some(
                    (userId) => userId.toString() === req.user.id
                );

                if (!isAssigned) {
                    return next(
                        errorHandler(403, "Not authorized to update checklist!")
                    );
                }
            }
        }

        task.todoCheckList = todoCheckList;

        const completedCount = task.todoCheckList.filter(
            (item) => item.completed
        ).length;

        const totalItems = task.todoCheckList.length;

        task.progress =
            totalItems > 0
                ? Math.round((completedCount / totalItems) * 100)
                : 0;

        if (task.progress === 100) {
            task.status = "Completed";
        } else if (task.progress > 0) {
            task.status = "In Progress";
        } else {
            task.status = "Pending";
        }

        await task.save();

        const updatedTask = await Task.findById(req.params.id)
            .populate("assignedTo", "name email profileImageUrl")
            .populate("createdBy", "name");

        res.status(200).json({
            success: true,
            message: "Task checklist updated!",
            task: updatedTask,
        });
    } catch (error) {
        next(error);
    }
};

export const getDashboardData = async(req,res,next)=> {
    try {

        const filter =
    req.user.role === "admin"
        ? {}
        : {
              $or: [
                  {
                      taskType: "Personal",
                      assignedTo: req.user.id,
                  },
                  {
                      taskType: "Team",
                      assignedTo: req.user.id,
                  },
              ],
          };
        //fetching statistics
        const totalTasks = await Task.countDocuments(filter);
        const pendingTasks = await Task.countDocuments({...filter, status: "Pending"});
        const completedTasks = await Task.countDocuments({...filter, status: "Completed"});
        const overdueTasks = await Task.countDocuments({
            ...filter,
            status: {$ne: "Completed"},
            dueDate: {$lt: new Date()}
        })

        const taskStatuses = ["Pending", "In Progress", "Completed"]

        const taskDistributionRaw = await Task.aggregate([
            {
                $match: filter,
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1},
                },
            },
        ])

        const taskDistribution = taskStatuses.reduce((acc, status)=> {
            const formattedKey = status.replace(/\s+/g, "") //removing spaces for response keys

            acc[formattedKey] = taskDistributionRaw.find((item)=> item._id === status)?.count || 0;

            return acc;
        }, {}) //we will get like this - pending:3, inProgress: 4 (spaces got removed)

        taskDistribution["All"] = totalTasks;

        const taskPriorities = ["Easy Win", "Focus Task", "Mission Critical"];

        const taskPriorityLevelRaw = await Task.aggregate([
            {
                $match: filter,
            },
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1},
                }
            }
        ])

        const taskPriorityLevel = taskPriorities.reduce((acc, priority)=>{
            const formattedKey = priority.replace(/\s+/g, "");
            acc[formattedKey] = taskPriorityLevelRaw.find((item) => item._id === priority)?.count || 0;

            return acc

        }, {})

        //fetching recent 10 tasks

        const recentTasks = await Task.find(filter).sort({createdAt: -1})
        .limit(10)
        .select("title status priority dueDate createdAt");

        res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks
            },
            charts: {
                taskDistribution,
                taskPriorityLevel
            },
            recentTasks
        })
        
    } catch (error) {
        next(error);
    }
}

