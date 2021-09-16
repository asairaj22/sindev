import { Component } from '@angular/core';
import { WorkflowService } from './workflow.service';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.css']
})

export class WorkflowComponent {

  constructor(private workflowService: WorkflowService) { }

  triggerCloudProvisioning() {
    this.workflowService.cloudProvisioning().subscribe();
  }

  triggerOrbiteraProvisioning() {
    this.workflowService.orbiteraProvisioning().subscribe();
  }

}