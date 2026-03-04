namespace Linuxdle.Domain.Exceptions;

public sealed class BadRequestException(string message) : LinuxdleException(message);
