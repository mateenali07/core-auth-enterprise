import asyncio
from app.database import AsyncSessionLocal
from app.models import User
from sqlalchemy import select

async def make_admin(email: str):
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if user:
            user.is_superuser = True
            await session.commit()
            print(f"SUCCESS: User {email} is now an Admin!")
        else:
            print(f"ERROR: User with email {email} not found in database.")

if __name__ == "__main__":
    target_email = "mateenaliabro77@gmail.com"
    asyncio.run(make_admin(target_email))
