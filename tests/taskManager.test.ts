import { expect } from 'chai';
import { createTask } from '../app/supabase/backendFunctions';

describe('TaskManager', () => {
  it('should create a new task with correct properties', () => {
    const taskInput = {
      title: "Implement login feature",
      description: "Create a secure login system with email and password",
      assignee: "user123",
      dueDate: "2024-12-31",
      priority: "High"
    };

    const newTask = await backendFunctions.createTask(taskInput);

    expect(newTask).to.have.property('id');
    expect(newTask.title).to.equal(taskInput.title);
    expect(newTask.description).to.equal(taskInput.description);
    expect(newTask.assignee).to.equal(taskInput.assignee);

    expect(newTask).to.have.property('id');
    expect(newTask.title).to.equal(taskInput.title);
    expect(newTask.description).to.equal(taskInput.description);
    expect(newTask.assignee).to.equal(taskInput.assignee);
    expect(newTask.dueDate).to.equal(taskInput.dueDate);
    expect(newTask.priority).to.equal(taskInput.priority);
    expect(newTask.status).to.equal("To Do");
    expect(newTask).to.have.property('createdAt');
  });
});