import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';

@Component({
  selector: 'app-crear-noticias',
  templateUrl: './crear-noticias.component.html',
  styleUrls: ['./crear-noticias.component.scss'],
})
export class CrearNoticiasComponent  implements OnInit {

  constructor() { }

  ngOnInit() {
    CUSTOM_ELEMENTS_SCHEMA
  }

}
