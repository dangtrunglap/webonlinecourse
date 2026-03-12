FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["OnlineCoursePlatform.API.csproj", "./"]
RUN dotnet restore "./OnlineCoursePlatform.API.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "OnlineCoursePlatform.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "OnlineCoursePlatform.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "OnlineCoursePlatform.API.dll"]
