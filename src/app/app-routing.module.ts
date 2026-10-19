import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './componentes/login/login.component';
import { ProductosComponent } from './componentes/productos/productos.component';
import { CarritoComponent } from './componentes/carrito/carrito.component';
import { FacturasComponent } from './componentes/facturas/facturas.component';
import { GestionComponent } from './componentes/gestion/gestion.component';
import { LoginGuard } from './guards/login.guard';
import { rolGuard } from './guards/rol.guard';

const routes: Routes = [
  { path: '', redirectTo: 'productos', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  // Pública: el invitado puede ver los productos
  { path: 'productos', component: ProductosComponent },

  {
    path: 'carrito',
    component: CarritoComponent,
    canActivate: [LoginGuard, rolGuard('CLIENTE')]
  },
  {
    path: 'facturas',
    component: FacturasComponent,
    canActivate: [LoginGuard, rolGuard('ADMIN', 'CLIENTE')]
  },
  {
    path: 'gestion',
    component: GestionComponent,
    canActivate: [LoginGuard, rolGuard('ADMIN')]
  },

  { path: '**', redirectTo: 'productos' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }