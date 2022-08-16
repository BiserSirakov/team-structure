import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { TeamMember } from './models/team-member.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  nodes: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const res = this.http
      .get<TeamMember>('http://localhost:1010/api/team')
      .subscribe((team) => {
        this.nodes = [this.mapTeamMemberToOrganizationNode(team)];
      });
  }

  mapTeamMemberToOrganizationNode(teamMember: TeamMember) {
    const node: { name: string; title: string; childs: any[] } = {
      name: teamMember.name,
      title: teamMember.email,
      childs: [],
    };

    teamMember.employees?.forEach((employee) => {
      node.childs?.push(this.mapTeamMemberToOrganizationNode(employee));
    });

    return node;
  }
}
