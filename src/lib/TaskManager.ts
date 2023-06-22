// Copyright (C) 2022 Theros < MisModding | SvalTek >
// 
// This file is part of MisCord.
// 
// MisCord is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// MisCord is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with MisCord.  If not, see <http://www.gnu.org/licenses/>.


class SimpleTaskLogger {
    public readonly _name: string;

    constructor(name: string) {
        this._name = name;
    }

    public debug(message: string): void {
        console.debug(`[${this._name}] ${message}`);
    }

    public info(message: string): void {
        console.info(`[${this._name}] ${message}`);
    }

    public warn(message: string): void {
        console.warn(`[${this._name}] ${message}`);
    }
}


export interface SimpleTaskContext {
    logger: SimpleTaskLogger;
}

export class SimpleTask {
    public name: string;
    public interval: number;
    public lastRun: number;
    public runCount: number;
    public timeout: number;
    public task: (task: SimpleTask, context: SimpleTaskContext) => Promise<void>;

    constructor(name: string, task: (task: SimpleTask, context: SimpleTaskContext) => Promise<void>, interval: number, timeout: number) {
        this.name = name;
        this.task = task;
        this.interval = interval;
        this.lastRun = 0;
        this.runCount = 0;
        this.timeout = timeout;
    }

    public ready() {
        return new Date().getTime() - this.lastRun >= this.interval;
    }

    public async run(context: SimpleTaskContext) {
        this.lastRun = Date.now();
        this.runCount++;
        await this.task(this, context);
    }

    public async runIfReady(context: SimpleTaskContext) {
        if (this.ready()) {
            await this.run(context);
        }
    }
}


class TaskManager {
    public tasks: SimpleTask[];
    public Logger: SimpleTaskLogger;

    constructor() {
        this.tasks = [];
        this.Logger = new SimpleTaskLogger('TaskManager');
    }

    public addTask(task: SimpleTask) {
        this.tasks.push(task);
    }

    public async runTasks() {
        for (const task of this.tasks) {
            try {
                await task.runIfReady({
                    logger: this.Logger
                });
            } catch (error) {
                console.error(error);
            }

        }
    }
}


export const taskManager = new TaskManager();
