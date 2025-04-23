import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; 

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAccess(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAccess(state.url);
  }

  private checkAccess(url: string): boolean | UrlTree {
    if (!this.authService.isLoggedIn()) {
      // Redirect to login with return URL
      return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: url } });
    }

    const roleId = this.authService.getUserRole();
    const expectedRole = this.getExpectedRole(url);

    if (roleId === expectedRole) {
      return true; // Allow access
    } else {
      // Redirect to the correct dashboard
      return this.router.createUrlTree([this.getRedirectUrl(roleId)]);
    }
  }

  private getExpectedRole(url: string): number | null {
    if (url.includes('/admin')) return 1;
    if (url.includes('/employer')) return 2;
    if (url.includes('/seeker')) return 3;
    return null;
  }

  private getRedirectUrl(roleId: number | null): string {
    switch (roleId) {
      case 1: return '/admin/adminDash';
      case 2: return '/employer/employerDash';
      case 3: return '/seeker/seekerDash';
      default: return '/login';
    }
  }
}